import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Album } from './album.schema';
import mongoose from 'mongoose';

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  })
  album: Album;
  @Prop({
    required: true,
  })
  title: string;
  @Prop({
    required: true,
  })
  duration: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
