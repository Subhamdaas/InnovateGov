import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}

export class SignupDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['GOVERNMENT', 'STARTUP', 'EVALUATOR'], { message: 'Role must be GOVERNMENT, STARTUP, or EVALUATOR' })
  role!: 'GOVERNMENT' | 'STARTUP' | 'EVALUATOR';

  @IsOptional()
  @IsString()
  orgName?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class GoogleAuthDto {
  @IsEmail({}, { message: 'A valid Google email address is required' })
  email!: string;

  @IsNotEmpty({ message: 'Google name is required' })
  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(['GOVERNMENT', 'STARTUP', 'EVALUATOR'], { message: 'Role must be GOVERNMENT, STARTUP, or EVALUATOR' })
  role?: 'GOVERNMENT' | 'STARTUP' | 'EVALUATOR';

  @IsOptional()
  @IsString()
  orgName?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  googleId?: string;
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private service: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.service.signup(dto);
  }

  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.service.googleAuth(dto);
  }

  @Get('me')
  getMe(@Headers('authorization') auth?: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = auth.split(' ')[1];
    const decoded = this.service.verifyToken(token);
    return this.service.me(decoded.sub);
  }
}
