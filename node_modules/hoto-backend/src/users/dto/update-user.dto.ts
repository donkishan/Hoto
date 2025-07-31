import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
     
      @IsNotEmpty()
      @IsString()
      name: string;
    
      @IsEmail()
      email: string;
    
      @IsNotEmpty()
      @Matches(/^\d{10}$/, { message: 'Mobile must be a 10-digit number' })
      mobile: string;
    
      @IsNotEmpty()
      division: string;
    
      @IsNotEmpty()
      @IsString()
      role: string;
    
      @IsOptional()
      password: string;
    
      @IsOptional()
      @Matches(/^data:image\/(png|jpg|jpeg);base64,/i, {
        message: 'Profile image must be a JPG or PNG file',
      })
      profileImage: string;
}
