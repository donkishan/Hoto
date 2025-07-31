import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { Division, DivisionDocument } from '../divisions/schemas/division.schema';

@Injectable()
export class AuthService {
  constructor(
      @InjectModel(User.name) private userModel: Model<User>,
      @InjectModel(Division.name) private divisionModel: Model<DivisionDocument>,
      @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
      private jwtService : JwtService
  ) {}
  
  async login(credentials:LoginDto){
    const {email,password}  = credentials;
    
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new UnauthorizedException("Wrong credetials.");  
    }

    const passwordMatch = await bcrypt.compare(password,user.password);
    if(!passwordMatch){
      throw new UnauthorizedException("Wrong credetials.");  
    }

    const tokens = await this.generateUserTokens(user._id);

    const division = await this.divisionModel.findById(user.division).lean();

    
    return {
      ...tokens,
      userId : user._id,
      firstName : user.name,
      email : user.email,
      rolesId : user.role,
      divisionId : user.division,
      divisionCode : division ? division.divisionCode : null,
      divisionName : division ? division.divisionName : null,      
    };
  }

  async generateUserTokens(userId){
    
    const accessToken = this.jwtService.sign({userId},{expiresIn:'3d'});
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken,userId);
    return{
      accessToken,
      refreshToken
    };
  }

  async storeRefreshToken(token: string, userId){
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.refreshTokenModel.updateOne(
      {userId},
      {$set : {expiryDate,token}},
      {upsert:true}
    );
  }

  async refreshToken(refreshToken : string){
    
    const token = await this.refreshTokenModel.findOne({
      token: refreshToken,
      expiryDate :{ $gte : new Date()}
    });

    if(!token){
      throw new UnauthorizedException("Refresh Token is invalid.");
    }

    return this.generateUserTokens(token.userId);

  }
}
 