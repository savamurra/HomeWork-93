import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { NotFoundError } from 'rxjs';
import { Track, TrackDocument } from '../schemas/track.schema';
import { CreateTrackDto } from './create.track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  getAll() {
    return this.trackModel.find();
  }

  @Get('findByAlbum')
  async getTrackWithAlbum(@Query('album') albumId: string) {
    const track = await this.trackModel.find({ album: albumId });
    if (!track)
      throw new NotFoundError(`Track with album id ${albumId} not found`);
    return track;
  }

  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    const album = await this.albumModel.findById(trackDto.album);
    if (!album) throw new NotFoundError('Album not found');
    const newTrack = new this.trackModel({
      title: trackDto.title,
      album: trackDto.album,
      duration: trackDto.duration,
    });

    return await newTrack.save();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.trackModel.findByIdAndDelete(id);
    return { message: 'Track deleted successfully.' };
  }
}
