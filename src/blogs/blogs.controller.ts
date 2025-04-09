import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('blogs')
@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  create(@Body() createBlogDto: CreateBlogDto, @Req() req: { user: User }) {
    return this.blogsService.create(createBlogDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiResponse({ status: 200, description: 'Return all blog posts' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tags') tags?: string[],
  ) {
    return this.blogsService.findAll(page, limit, tags);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by id' })
  @ApiResponse({ status: 200, description: 'Return the blog post' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: { user: User },
  ) {
    return this.blogsService.update(id, updateBlogDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.blogsService.remove(id, req.user);
  }
} 