import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface SignupDto {
  email: string;
  password: string;
  name: string;
  role: 'GOVERNMENT' | 'STARTUP' | 'EVALUATOR';
  orgName?: string;
  departmentId?: string;
  location?: string;
  sectorTags?: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  email: string;
  name: string;
  role?: 'GOVERNMENT' | 'STARTUP' | 'EVALUATOR';
  orgName?: string;
  departmentId?: string;
  googleId?: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  public verifyPassword(password: string, storedHash?: string | null): boolean {
    if (!storedHash || !password) {
      return false; // MUST NEVER return true if storedHash is empty
    }
    const parts = storedHash.split(':');
    if (parts.length < 2) {
      return false;
    }
    const [salt, key] = parts;
    if (!salt || !key) {
      return false;
    }
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
      return false;
    }
  }

  private generateToken(userId: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      })
    ).toString('base64url');
    const secret = process.env.JWT_SECRET || 'startsi-supabase-jwt-secret-key';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  public verifyToken(token: string): { sub: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      const [header, payload, signature] = parts;
      const secret = process.env.JWT_SECRET || 'startsi-supabase-jwt-secret-key';
      const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
      if (signature !== expectedSig) {
        throw new Error('Invalid signature');
      }
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (!decodedPayload.sub) {
        throw new Error('Missing subject in token');
      }
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      return decodedPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private formatUser(user: Record<string, any>) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async signup(dto: SignupDto) {
    if (!dto.email || !dto.password || !dto.name || !dto.role) {
      throw new BadRequestException('Name, email, password, and role are required.');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }

    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let startupId: string | undefined = undefined;
    let departmentId: string | undefined = dto.departmentId;

    // Handle Startup profile creation
    if (dto.role === 'STARTUP') {
      startupId = `start-${Date.now()}`;
      await this.prisma.startup.create({
        data: {
          id: startupId,
          name: dto.orgName?.trim() || `${dto.name}'s Startup`,
          sectorTags: dto.sectorTags || ['GovTech', 'AI', 'Public Sector Innovation'],
          capabilitySummary: `Innovative solution provider founded by ${dto.name}`,
          location: dto.location || 'India',
        },
      });
    } else if (dto.role === 'GOVERNMENT' && !departmentId) {
      const dept = await this.prisma.department.findFirst();
      if (dept) {
        departmentId = dept.id;
      } else {
        departmentId = 'dept-pwd';
        await this.prisma.department.create({
          data: {
            id: departmentId,
            name: dto.orgName?.trim() || 'Public Works & Urban Development',
          },
        });
      }
    }

    const passwordHash = this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        name: dto.name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: dto.role,
        startupId,
        departmentId,
      },
      include: {
        department: true,
        startup: true,
      },
    });

    console.log(`✅ [SIGNUP SUCCESS] New persistent user registered: ${user.email} (Role: ${user.role})`);

    return {
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
      user: this.formatUser(user),
    };
  }

  async login(dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Both email and password are required.');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    const user: any = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { department: true, startup: true },
    });

    // RULE 1: If user does NOT exist in database -> FAIL. NEVER auto-create.
    if (!user) {
      console.warn(`❌ [LOGIN REJECTED] Email not found: ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // RULE 2: If user has no password stored -> FAIL.
    if (!user.password) {
      console.warn(`❌ [LOGIN REJECTED] User ${normalizedEmail} has no password set.`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // RULE 3: Compare submitted password with stored password hash using timing-safe comparison
    const isPasswordValid = this.verifyPassword(dto.password, user.password);
    if (!isPasswordValid) {
      console.warn(`❌ [LOGIN REJECTED] Password mismatch for: ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // BOTH email and password verified -> SUCCESS
    console.log(`🔑 [LOGIN SUCCESS] Verified credentials for: ${user.email} (Role: ${user.role})`);

    const token = this.generateToken(user.id);
    return {
      token,
      user: this.formatUser(user),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true, startup: true },
    });
    if (!user) {
      throw new UnauthorizedException('User session expired or not found');
    }
    return this.formatUser(user);
  }

  async googleAuth(dto: GoogleAuthDto) {
    if (!dto.email || !dto.name) {
      throw new BadRequestException('Google email and name are required.');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if user already exists
    let user: any = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { department: true, startup: true },
    });

    if (!user) {
      const assignedRole = dto.role || 'STARTUP';
      const userId = `usr-g-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let startupId: string | undefined = undefined;
      let departmentId: string | undefined = dto.departmentId;

      if (assignedRole === 'STARTUP') {
        startupId = `start-g-${Date.now()}`;
        await this.prisma.startup.create({
          data: {
            id: startupId,
            name: dto.orgName?.trim() || `${dto.name}'s Ventures`,
            sectorTags: ['GovTech', 'AI', 'Innovation'],
            capabilitySummary: `Innovative solution provider registered via Google by ${dto.name}`,
            location: 'India',
          },
        });
      } else if (assignedRole === 'GOVERNMENT' && !departmentId) {
        const dept = await this.prisma.department.findFirst();
        if (dept) {
          departmentId = dept.id;
        } else {
          departmentId = 'dept-pwd';
          await this.prisma.department.create({
            data: {
              id: departmentId,
              name: dto.orgName?.trim() || 'Public Works & Urban Development',
            },
          });
        }
      }

      user = await this.prisma.user.create({
        data: {
          id: userId,
          name: dto.name.trim(),
          email: normalizedEmail,
          password: null, // Google OAuth accounts do not require a local password
          role: assignedRole,
          startupId,
          departmentId,
        },
        include: {
          department: true,
          startup: true,
        },
      });

      console.log(`🌐 [GOOGLE AUTH - SIGNUP] New user registered via Google: ${user.email} (Role: ${user.role})`);
    } else {
      console.log(`🌐 [GOOGLE AUTH - SIGNIN] Existing user signed in via Google: ${user.email} (Role: ${user.role})`);
    }

    const token = this.generateToken(user.id);
    return {
      token,
      user: this.formatUser(user),
    };
  }
}
