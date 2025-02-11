import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ArtistDocument = Artist & Document;

@Schema()
export class Artist {
  @Prop({
    required: true,
  })
  name: string;
  @Prop({
    default: null,
  })
  photo: string;
  @Prop({
    default: null,
  })
  info: string;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
