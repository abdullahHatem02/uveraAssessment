import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';
import { CustomLogger } from '../shared/logger/logger.service';

@Injectable()
export class BlogsService {
  private logger: CustomLogger;

  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    this.logger = new CustomLogger('BlogsService');
  }

  setLogger(logger: CustomLogger) {
    this.logger = logger;
    this.logger.setContext('BlogsService');
  }

  
  async create(createBlogDto: CreateBlogDto, author: User): Promise<Blog> {
      // Check for existing blog with same title and author (idempotency check)
      const existingBlog = await this.blogsRepository.findOne({
        where: {
          title: createBlogDto.title,
          author: { id: author.id }
        }
      });

      if (existingBlog && existingBlog.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 1)) {
        // Only allow one blog per hour with same title and author in case of same request
        // This is to prevent duplicate blog posts from being created if the same request is sent multiple times.
        // In production, we should use a more robust idempotency mechanism like UUIDs or Redis.
        // This is a simple solution for this task.
        this.logger.warn(`Blog creation skipped - duplicate found with title: ${createBlogDto.title}`);
        return existingBlog;
      }

      const blog = this.blogsRepository.create({
        ...createBlogDto,
        author,
      });
      const savedBlog = await this.blogsRepository.save(blog);
      return savedBlog;
    
  }

  async findAll(page = 1, limit = 10, tags?: string[]): Promise<{ data: Blog[]; total: number }> {
  
      const cacheKey = `blogs:${page}:${limit}:${tags?.join(',') || 'all'}`;
      const cached = await this.cacheManager.get<{ data: Blog[]; total: number }>(cacheKey);

      if (cached) {
        return cached;
      }

      const query = this.blogsRepository
        .createQueryBuilder('blog')
        .leftJoinAndSelect('blog.author', 'author')
        .orderBy('blog.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (tags && tags.length > 0) {
        query.where('blog.tags && :tags', { tags });
      }

      const [data, total] = await query.getManyAndCount();
      const result = { data, total };

      await this.cacheManager.set(cacheKey, result, 60 * 60); // 
      return result;
   
  }

  
  async findOne(id: string): Promise<Blog> {
  
      const cacheKey = `blog:${id}`;
      const cached = await this.cacheManager.get<Blog>(cacheKey);

      if (cached) {
        return cached;
      }

      const blog = await this.blogsRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      await this.cacheManager.set(cacheKey, blog, 60 * 60); // Cache f
      return blog;
    
  }

  
  async update(id: string, updateBlogDto: UpdateBlogDto, user: User): Promise<Blog> {
      const blog = await this.findOne(id);
      
      if (user.role !== 'admin' && blog.author.id !== user.id) {
        throw new NotFoundException('Blog not found');
      }

      Object.assign(blog, updateBlogDto);
      const updatedBlog = await this.blogsRepository.save(blog);
      
      // Invalidate cache
      await this.cacheManager.del(`blog:${id}`);
      await this.cacheManager.del('blogs:*');

      return updatedBlog;
    
  }

  async remove(id: string, user: User): Promise<void> {
      const blog = await this.findOne(id);
      
      if (user.role !== 'admin' && blog.author.id !== user.id) {
        throw new NotFoundException('Blog not found');
      }

      await this.blogsRepository.remove(blog);
      
      // Invalidate cache
      await this.cacheManager.del(`blog:${id}`);
      await this.cacheManager.del('blogs:*');
    
  }
} 