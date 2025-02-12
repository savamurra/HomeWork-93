import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArtistDto } from './create.artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  getAll() {
    return this.artistModel.find();
  }
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);
    if (!artist) throw new NotFoundError('Artist not found');
    return artist;
  }
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', { dest: './public/uploads/artists' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto,
  ) {
    const newArtist = new this.artistModel({
      name: artistDto.name,
      photo: file && file.filename ? '/uploads/artists/' + file.filename : null,
      info: artistDto.info,
    });
    return await newArtist.save();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.artistModel.findByIdAndDelete(id);
    return { message: 'Artists deleted successfully.' };
  }
}
