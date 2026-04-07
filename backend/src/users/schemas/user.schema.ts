import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })  // ← index added
  email!: string;

  @Prop({ required: true, select: false })  // ← select:false hides password by default
  password!: string;

  @Prop({ default: 'client', enum: ['client', 'provider'] })
  role!: 'client' | 'provider';

  @Prop({
    type: {
      days: [String],
      startHour: Number,
      endHour: Number,
    },
    default: null,
  })
  availability!: {
    days: string[];
    startHour: number;
    endHour: number;
  } | null;
}

export const UserSchema = SchemaFactory.createForClass(User);