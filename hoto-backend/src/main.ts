import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Set Referrer-Policy manually
  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // ✅ Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200'], // or '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false
  }));

  app.useGlobalGuards(new AuthGuard(app.get(JwtService)));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
