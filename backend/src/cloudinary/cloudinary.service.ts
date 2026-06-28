import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException(
        'Image is required',
      );
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result!.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
