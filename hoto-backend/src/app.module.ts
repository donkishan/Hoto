import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { DivisionsModule } from './divisions/divisions.module';
import { ProjectsModule } from './projects/projects.module';
import config from './config/config';
import { TblogsModule } from './tblogs/tblogs.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CountriesModule } from './countries/countries.module';
import { HotoRequestsModule } from './hoto-requests/hoto-requests.module';
import { BlockInformationModule } from './block-information/block-information.module';
import { SiteReadinessModule } from './site-readiness/site-readiness.module';
import { BlockDetailsModule } from './block-details/block-details.module';
import { PunchPointModule } from './punch-point/punch-point.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('database.connectionString'),
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
      global: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'mail.proteamsolution.com',
        port: 465,
        secure: true,
        auth: {
          user: 'renewsms@proteamsolution.com',
          pass: 'Welcome@1234$#',
        },
      },
      defaults: {
        from: '"ProTeam" <renewsms@proteamsolution.com>',
      },
    }),
    TblogsModule,
    UsersModule,
    RolesModule,
    AuthModule,
    DivisionsModule,
    ProjectsModule,
    CountriesModule,
    HotoRequestsModule,
    BlockInformationModule,
    SiteReadinessModule,
    BlockDetailsModule,
    PunchPointModule,
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
