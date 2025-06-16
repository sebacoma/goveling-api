import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetLocationDto } from '../dto/get-location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AuthGuard)
  @Post()
  async getCity(@Body() body: GetLocationDto) {
    return this.locationService.getCityFromCoordinates(body.lat, body.lng);
  }
}
