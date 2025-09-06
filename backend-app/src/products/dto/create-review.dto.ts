import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
