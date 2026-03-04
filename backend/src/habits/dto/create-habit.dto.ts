import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  targetCount?: number;

  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
