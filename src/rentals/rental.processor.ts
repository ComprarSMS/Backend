import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RentalsService } from './rentals.service';

type RentalJob = { rentalId: string };

@Processor('rentals')
export class RentalProcessor extends WorkerHost {
  private readonly logger = new Logger(RentalProcessor.name);

  constructor(private readonly rentals: RentalsService) {
    super();
  }

  async process(job: Job<RentalJob>): Promise<void> {
    if (job.name === 'expire') {
      await this.rentals.expire(job.data.rentalId);
      return;
    }

    if (job.name === 'simulate-sms') {
      this.logger.log(`SMS simulado para ${job.data.rentalId}`);
      await this.rentals.simulateIncomingSms(job.data.rentalId);
    }
  }
}
