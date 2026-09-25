import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { NumberStatus, RentalStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { RealtimeGateway } from './realtime.gateway';
import { buildVerificationSms, rentalInclude } from './sms';

@Injectable()
export class RentalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    @InjectQueue('rentals') private readonly queue: Queue,
  ) {}

  async list() {
    const [active, recent] = await Promise.all([
      this.prisma.rental.findMany({
        where: { status: RentalStatus.ACTIVE },
        include: rentalInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rental.findMany({
        where: { status: { not: RentalStatus.ACTIVE } },
        include: rentalInclude,
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return [...active, ...recent];
  }

  async get(id: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id },
      include: rentalInclude,
    });
    if (!rental) throw new NotFoundException('Sesión no encontrada');
    return rental;
  }

  async create(dto: CreateRentalDto) {
    const service = await this.prisma.service.findUnique({ where: { slug: dto.serviceSlug } });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    const ttlSeconds = Number(process.env.RENTAL_TTL_SECONDS ?? 180);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const rental = await this.prisma.$transaction(async (tx) => {
      const locked = await tx.virtualNumber.updateMany({
        where: { id: dto.virtualNumberId, status: NumberStatus.AVAILABLE },
        data: { status: NumberStatus.RENTED },
      });

      if (locked.count !== 1) {
        const exists = await tx.virtualNumber.findUnique({ where: { id: dto.virtualNumberId } });
        if (!exists) throw new NotFoundException('Número no encontrado');
        throw new ConflictException('Ese número ya está en uso');
      }

      return tx.rental.create({
        data: {
          virtualNumberId: dto.virtualNumberId,
          serviceId: service.id,
          expiresAt,
          status: RentalStatus.ACTIVE,
        },
        include: rentalInclude,
      });
    });

    const smsDelay = Number(process.env.SMS_DELAY_MS ?? 5000);
    await this.queue.add('expire', { rentalId: rental.id }, {
      delay: ttlSeconds * 1000,
      jobId: `expire-${rental.id}`,
      removeOnComplete: true,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    await this.queue.add('simulate-sms', { rentalId: rental.id }, {
      delay: smsDelay,
      jobId: `sms-${rental.id}`,
      removeOnComplete: true,
      attempts: 1,
    });

    this.realtime.rentalUpdated(rental);
    return rental;
  }

  async cancel(id: string) {
    return this.finish(id, RentalStatus.CANCELLED);
  }

  async complete(id: string) {
    return this.finish(id, RentalStatus.COMPLETED);
  }

  async expire(id: string) {
    try {
      await this.finish(id, RentalStatus.EXPIRED);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) return;
      throw error;
    }
  }

  async simulateIncomingSms(rentalId: string, strict = false) {
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { service: true },
    });

    if (!rental || rental.status !== RentalStatus.ACTIVE) {
      if (strict) throw new BadRequestException('Esa sesión ya no puede recibir SMS');
      return null;
    }

    const sms = buildVerificationSms(rental.service.slug);
    const message = await this.prisma.message.create({
      data: {
        rentalId,
        sender: rental.service.name,
        body: sms.body,
        code: sms.code,
      },
    });

    this.realtime.smsReceived({ rentalId, message });
    return message;
  }

  private async finish(id: string, status: RentalStatus) {
    const rental = await this.prisma.rental.findUnique({ where: { id } });
    if (!rental) throw new NotFoundException('Sesión no encontrada');

    const updated = await this.prisma.$transaction(async (tx) => {
      const closed = await tx.rental.updateMany({
        where: { id, status: RentalStatus.ACTIVE },
        data: { status },
      });
      if (closed.count !== 1) throw new ConflictException('Esa sesión ya terminó');

      await tx.virtualNumber.update({
        where: { id: rental.virtualNumberId },
        data: { status: NumberStatus.AVAILABLE },
      });

      return tx.rental.findUniqueOrThrow({ where: { id }, include: rentalInclude });
    });

    await this.removeJobs(id);
    this.realtime.rentalUpdated(updated);
    return updated;
  }

  private async removeJobs(id: string) {
    await Promise.all([
      this.queue.remove(`expire-${id}`).catch(() => undefined),
      this.queue.remove(`sms-${id}`).catch(() => undefined),
    ]);
  }
}
