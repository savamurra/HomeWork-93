import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Artist, ArtistSchema } from '../schemas/artist.schema';
import { Album, AlbumSchema } from '../schemas/album.schema';
import { Track, TrackSchema } from '../schemas/track.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/spotify'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Artist.name, schema: ArtistSchema },
      { name: Album.name, schema: AlbumSchema },
      { name: Track.name, schema: TrackSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
