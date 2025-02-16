import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './create.user.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';

@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post()
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    const user: UserDocument = new this.userModel({
      email: registerUserDto.email,
      password: registerUserDto.password,
      displayName: registerUserDto.displayName,
    });

    user.generateToken();
    return user.save();
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  login(@Req() req: Request<{ user: User }>) {
    return req.user;
  }

  @UseGuards(TokenAuthGuard)
  @Delete('sessions')
  async delete(@Req() req: Request<{ user: User }>) {
    const user = await this.userModel.findOne({ _id: req.user });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    user.token = ' ';
    await user.save();
    return { message: 'User logout successfully.' };
  }
}
