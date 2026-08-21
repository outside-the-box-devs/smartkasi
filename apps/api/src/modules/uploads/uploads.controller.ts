import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PresignDto, UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post('presign')
  @HttpCode(200)
  presign(@Body() dto: PresignDto) {
    return this.service.presign(dto);
  }
}
