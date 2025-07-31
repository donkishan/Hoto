import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { Division, DivisionSchema } from '../divisions/schemas/division.schema';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema},
      { name: RefreshToken.name, schema: RefreshTokenSchema},
      { name: Division.name, schema: DivisionSchema}
    ]),
  ],
})
export class AuthModule {}
