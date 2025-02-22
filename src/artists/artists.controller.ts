import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArtistDto } from './create.artist.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as crypto from 'node:crypto';
import { RolesGuard } from '../token-auth/token.role.guard';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import { Roles } from '../roles/roles.decorator';

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

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/artists',
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
    @Body() artistDto: CreateArtistDto,
  ) {
    const newArtist = new this.artistModel({
      name: artistDto.name,
      photo: file && file.filename ? '/uploads/artists/' + file.filename : null,
      info: artistDto.info,
    });
    return await newArtist.save();
  }

  @UseGuards(TokenAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const artist = await this.artistModel.findByIdAndDelete(id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return { message: 'Artists deleted successfully.', artist };
  }
}
