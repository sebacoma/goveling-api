import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLocationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  lng: number;
}
