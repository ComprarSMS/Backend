import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RentalProcessor } from './rental.processor';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'rentals' })],
  controllers: [RentalsController],
  providers: [RentalsService, RentalProcessor, RealtimeGateway],
})
export class RentalsModule {}
