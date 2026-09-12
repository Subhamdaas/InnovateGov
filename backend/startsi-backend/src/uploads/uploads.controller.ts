import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadsService } from './uploads.service';
import type { Request } from 'express';

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedName}${ext}`;
    cb(null, uniqueName);
  },
});

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 25 * 1024 * 1024 } }))
  uploadSingle(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:4000';
    const hostUrl = `${protocol}://${host}`;
    return this.uploadsService.processUploadedFile(file, hostUrl);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, { storage, limits: { fileSize: 25 * 1024 * 1024 } }))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:4000';
    const hostUrl = `${protocol}://${host}`;
    return files.map((file) => this.uploadsService.processUploadedFile(file, hostUrl));
  }
}
