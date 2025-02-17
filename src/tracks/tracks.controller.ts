import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { NotFoundError } from 'rxjs';
import { Track, TrackDocument } from '../schemas/track.schema';
import { CreateTrackDto } from './create.track.dto';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import { RolesGuard } from '../token-auth/token.role.guard';
import { Roles } from '../roles/roles.decorator';

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

  @UseGuards(TokenAuthGuard)
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

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const track = await this.trackModel.findByIdAndDelete(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return { message: 'Track deleted successfully.', track };
  }
}
