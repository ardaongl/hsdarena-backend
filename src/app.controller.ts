import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  // köke gelenleri Swagger'a yönlendir
  @Get()
  @Redirect('/docs', 302)
  root() {
    return;
  }

  // /api/health (global prefix var)
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'quiz-backend',
      time: new Date().toISOString(),
    };
  }
}
