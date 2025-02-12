import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { Album } from '../schemas/album.schema';
import { NotFoundError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create.album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
    @InjectModel(Album.name) private albumModel: Model<Album>,
  ) {}

  @Get()
  getAll() {
    return this.albumModel.find();
  }

  @Get(':id')
  async getAlbumById(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);
    if (!album) throw new NotFoundError(`Album with id ${id} not found`);
    return album;
  }

  @Get('findByQuery')
  async getAlbumWithArtist(@Query('id') id: string) {
    const album = await this.albumModel.find({ artist: id });
    if (!album) throw new NotFoundError(`Album with artist id ${id} not found`);
    return album;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumDto: CreateAlbumDto,
  ) {
    const artist = await this.artistModel.findById(albumDto.artist);
    if (!artist) throw new NotFoundError('Artist not found');
    const newAlbum = new this.albumModel({
      artist: albumDto.artist,
      title: albumDto.title,
      releaseDate: albumDto.releaseDate,
      image: file && file.filename ? '/uploads/albums/' + file.filename : null,
    });

    return await newAlbum.save();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.albumModel.findByIdAndDelete(id);
    return { message: 'Album deleted successfully.' };
  }
}
