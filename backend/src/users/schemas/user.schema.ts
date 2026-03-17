import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['client', 'provider'] })
  role: 'client' | 'provider';

  @Prop({ type: Object, default: null })
  availability: {
    days: string[];
    startHour: number;
    endHour: number;
  } | null;
}

export const UserSchema = SchemaFactory.createForClass(User);