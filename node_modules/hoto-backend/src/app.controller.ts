import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard)
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
  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
