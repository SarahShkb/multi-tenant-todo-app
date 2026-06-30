import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Optional: allow changing password via the same endpoint.
  // If you'd rather keep password changes separate (recommended for
  // real apps — usually requires current password confirmation),
  // remove this field and add a dedicated PATCH /users/me/password route.
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}