import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  provider: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ default: 'confirmed' })
  status: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);