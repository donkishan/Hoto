import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';


@Controller('protected')
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  someProtectedRoute(@Req() req){
    return {
      message : "Accessed resources",
      userId : req.userId
    }
  }
  
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
