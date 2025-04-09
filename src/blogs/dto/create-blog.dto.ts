import { IsString, IsArray, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ description: 'The title of the blog post', minLength: 3 })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ description: 'The content of the blog post', minLength: 10 })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ description: 'Tags associated with the blog post', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
} 