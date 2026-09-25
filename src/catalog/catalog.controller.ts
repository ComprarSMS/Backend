import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('services')
  services() {
    return this.catalog.listServices();
  }

  @Get('numbers')
  numbers() {
    return this.catalog.listNumbers();
  }
}
