import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { Track, TrackDocument } from '../schemas/track.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async seed() {
    await this.artistModel.deleteMany({});
    await this.albumModel.deleteMany({});
    await this.trackModel.deleteMany({});
    await this.userModel.deleteMany({});

    const [firstArtist, secondArtist] = await this.artistModel.insertMany([
      {
        name: 'Ed Sheeran',
        info: 'England singer',
      },
      {
        name: 'Michael Jackson',
        info: 'American Jackson',
      },
    ]);
    const [firstAlbum, secondAlbum] = await this.albumModel.insertMany([
      {
        title: 'First Album',
        artist: firstArtist._id,
        releaseDate: '2023-01-01',
      },
      {
        title: 'Second Album',
        artist: secondArtist._id,
        releaseDate: '2023-06-01',
      },
    ]);
    await this.trackModel.insertMany([
      {
        title: 'Big mountain',
        album: firstAlbum._id,
        duration: 3.0,
      },
      {
        title: 'Big Lake',
        album: firstAlbum._id,
        duration: 2.45,
      },
      {
        title: 'Kama',
        album: secondAlbum._id,
        duration: 3.0,
      },
      {
        title: 'Sakamoto',
        album: secondAlbum._id,
        duration: 3.0,
      },
    ]);
    await this.userModel.create(
      {
        email: 'kama@gmail.com',
        password: '123',
        token: randomUUID(),
        displayName: 'Kama',
        role: 'admin',
      },
      {
        email: 'mirana@gmail.com',
        password: '123',
        token: randomUUID(),
        displayName: 'Mirana',
        role: 'user',
      },
    );
  }
}
