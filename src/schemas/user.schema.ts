import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export interface UserDocument extends Document {
  email: string;
  password: string;
  token: string;
  displayName?: string;
  role: string;
  generateToken: () => void;
  checkPassword: (password: string) => Promise<boolean>;
}

const SALT_WORK_FACTOR = 10;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  token: string;
  @Prop()
  displayName: string;
  @Prop({ required: true, default: 'user', enum: ['admin', 'user'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function (this: UserDocument) {
  this.token = randomUUID();
};

UserSchema.methods.checkPassword = function (
  this: UserDocument,
  password: string,
) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});
