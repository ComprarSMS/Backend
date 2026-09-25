import { IsString } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  virtualNumberId!: string;

  @IsString()
  serviceSlug!: string;
}
