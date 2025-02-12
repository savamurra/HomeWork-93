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
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { NotFoundError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create.album.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as crypto from 'node:crypto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  getAll() {
    return this.albumModel.find();
  }

  @Get('findByArtist')
  async getTrackWithAlbum(@Query('artist') artistId: string) {
    const album = await this.albumModel.find({ artist: artistId });
    if (!album)
      throw new NotFoundError(`Album with artist id ${artistId} not found`);
    return album;
  }

  @Get(':id')
  async getAlbumById(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);
    if (!album) throw new NotFoundError(`Album with id ${id} not found`);
    return album;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/albums',
        filename: (_req, file, callback) => {
          const ex = extname(file.originalname);
          const fileName = crypto.randomUUID();
          callback(null, fileName + ex);
        },
      }),
    }),
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
