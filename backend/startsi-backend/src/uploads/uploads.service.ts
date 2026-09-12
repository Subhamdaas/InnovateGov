import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  processUploadedFile(file: Express.Multer.File, hostUrl: string) {
    const filename = file.filename || path.basename(file.path);
    const fileUrl = `${hostUrl}/uploads/${filename}`;
    return {
      name: file.originalname,
      filename: filename,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
    };
  }
}
