import { IsString, IsArray, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBlogDto {
  @ApiPropertyOptional({ description: 'The title of the blog post', minLength: 3 })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The content of the blog post', minLength: 10 })
  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Tags associated with the blog post', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
} 