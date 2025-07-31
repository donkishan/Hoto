import { IsBoolean, IsDate, IsEmail, IsNumber, IsString, IsNotEmpty, Matches, IsIn, IsOptional } from "class-validator";

export class CreateUserDto {
  
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


