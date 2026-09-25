import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: true } })
export class RealtimeGateway implements OnGatewayInit {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('Socket.io listo');
  }

  smsReceived(payload: unknown) {
    this.server?.emit('sms.received', payload);
  }

  rentalUpdated(payload: unknown) {
    this.server?.emit('rental.updated', payload);
  }
}
