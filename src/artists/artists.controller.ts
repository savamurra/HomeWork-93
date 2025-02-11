import { Controller, Get } from '@nestjs/common';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  getAll() {
    return this.artistModel.find();
  }
}
