import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum UploadPurpose {
  shop_logo = 'shop_logo',
  product_image = 'product_image',
  flyer = 'flyer',
  licence_doc = 'licence_doc',
  delivery_proof = 'delivery_proof',
  avatar = 'avatar',
}

export enum UploadContentType {
  jpeg = 'image/jpeg',
  png = 'image/png',
  webp = 'image/webp',
  pdf = 'application/pdf',
}

export class PresignDto {
  @IsEnum(UploadPurpose) purpose: UploadPurpose;
  @IsEnum(UploadContentType) content_type: UploadContentType;
  @IsOptional() @IsUUID() shop_id?: string;
}

const EXTENSIONS: Record<UploadContentType, string> = {
  [UploadContentType.jpeg]: 'jpg',
  [UploadContentType.png]: 'png',
  [UploadContentType.webp]: 'webp',
  [UploadContentType.pdf]: 'pdf',
};

/**
 * Image bytes never pass through this API. The client asks for a presigned URL,
 * PUTs straight to R2, then sends us the public URL. Proxying uploads through a
 * Node process is a good way to fall over on a 4 MB flyer photo from a phone on
 * a bad connection.
 */
@Injectable()
export class UploadsService {
  private client: S3Client;

  constructor(private readonly config: ConfigService) {}

  private s3(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.config.get<string>('r2.accountId')}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.get<string>('r2.accessKeyId') ?? '',
          secretAccessKey: this.config.get<string>('r2.secretAccessKey') ?? '',
        },
      });
    }
    return this.client;
  }

  async presign(dto: PresignDto) {
    const bucket = this.config.get<string>('r2.bucket') ?? 'smartkasi';
    const ext = EXTENSIONS[dto.content_type];
    const key = `${dto.purpose}/${dto.shop_id ?? 'global'}/${randomUUID()}.${ext}`;

    const uploadUrl = await getSignedUrl(
      this.s3(),
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: dto.content_type }),
      { expiresIn: 600 },
    );

    return {
      upload_url: uploadUrl,
      public_url: `${this.config.get<string>('r2.publicBaseUrl')}/${key}`,
      method: 'PUT' as const,
      headers: { 'Content-Type': dto.content_type },
      expires_at: new Date(Date.now() + 600_000).toISOString(),
    };
  }
}
