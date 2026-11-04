import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator.js';
import { AppService } from './app.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Health check, dipakai untuk cek server hidup (tanpa token). */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
