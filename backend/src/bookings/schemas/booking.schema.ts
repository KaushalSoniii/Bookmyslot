import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  client!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  provider!: Types.ObjectId;

  @Prop({ required: true, index: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({
    default: 'confirmed',
    enum: ['confirmed', 'cancelled', 'completed'],
  })
  status!: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ provider: 1, startTime: 1 });
BookingSchema.index({ client: 1, startTime: -1 });