import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentals: RentalsService) {}

  @Get()
  list() {
    return this.rentals.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.rentals.get(id);
  }

  @Post()
  create(@Body() dto: CreateRentalDto) {
    return this.rentals.create(dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.rentals.cancel(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.rentals.complete(id);
  }

  @Post(':id/simulate')
  simulate(@Param('id') id: string) {
    return this.rentals.simulateIncomingSms(id, true);
  }
}
