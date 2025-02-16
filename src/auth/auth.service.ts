import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (user && (await user.checkPassword(password))) {
      user.generateToken();
      await user.save();

      return user;
    }
    return null;
  }
}
