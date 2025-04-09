import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';

describe('BlogsService', () => {
  let service: BlogsService;
  let blogRepository: Repository<Blog>;
  let cacheManager: any;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.EDITOR,
    blogs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBlog = {
    id: '1',
    title: 'Test Blog',
    content: 'Test Content',
    tags: ['test'],
    author: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockBlogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: mockBlogRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    blogRepository = module.get(getRepositoryToken(Blog));
    cacheManager = module.get(CACHE_MANAGER);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog post', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
      };

      mockBlogRepository.create.mockReturnValue(mockBlog);
      mockBlogRepository.save.mockResolvedValue(mockBlog);

      const result = await service.create(createBlogDto, mockUser);

      expect(result).toEqual(mockBlog);
      expect(blogRepository.create).toHaveBeenCalledWith({
        ...createBlogDto,
        author: mockUser,
      });
      expect(blogRepository.save).toHaveBeenCalledWith(mockBlog);
    });
  });

  describe('findAll', () => {
    it('should return cached blog posts if available', async () => {
      const page = 1;
      const limit = 10;
      const tags = ['test'];
      const cachedResult = { data: [mockBlog], total: 1 };

      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll(page, limit, tags);

      expect(result).toEqual(cachedResult);
      expect(cacheManager.get).toHaveBeenCalledWith(`blogs:${page}:${limit}:${tags.join(',')}`);
      expect(blogRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached blog post if available', async () => {
      const id = '1';

      mockCacheManager.get.mockResolvedValue(mockBlog);

      const result = await service.findOne(id);

      expect(result).toEqual(mockBlog);
      expect(cacheManager.get).toHaveBeenCalledWith(`blog:${id}`);
      expect(blogRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return a blog post by id', async () => {
      const id = '1';

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(mockBlog);

      const result = await service.findOne(id);

      expect(result).toEqual(mockBlog);
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['author'],
      });
      expect(cacheManager.set).toHaveBeenCalledWith(`blog:${id}`, mockBlog, 60 * 60);
    });

    it('should throw NotFoundException if blog post not found', async () => {
      const id = '1';

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a blog post for the owner', async () => {
      const id = '1';
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(mockBlog);
      mockBlogRepository.save.mockResolvedValue({ ...mockBlog, ...updateBlogDto });

      const result = await service.update(id, updateBlogDto, mockUser);

      expect(result).toEqual({ ...mockBlog, ...updateBlogDto });
      expect(blogRepository.save).toHaveBeenCalledWith({ ...mockBlog, ...updateBlogDto });
      expect(cacheManager.del).toHaveBeenCalledWith(`blog:${id}`);
      expect(cacheManager.del).toHaveBeenCalledWith('blogs:*');
    });

    it('should throw NotFoundException if blog post not found', async () => {
      const id = '1';
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateBlogDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not the owner or admin', async () => {
      const id = '1';
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
      };
      const otherUser = { ...mockUser, id: '2' };

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(mockBlog);

      await expect(service.update(id, updateBlogDto, otherUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a blog post for the owner', async () => {
      const id = '1';

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(mockBlog);
      mockBlogRepository.remove.mockResolvedValue(mockBlog);

      await service.remove(id, mockUser);

      expect(blogRepository.remove).toHaveBeenCalledWith(mockBlog);
      expect(cacheManager.del).toHaveBeenCalledWith(`blog:${id}`);
      expect(cacheManager.del).toHaveBeenCalledWith('blogs:*');
    });

    it('should throw NotFoundException if blog post not found', async () => {
      const id = '1';

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not the owner or admin', async () => {
      const id = '1';
      const otherUser = { ...mockUser, id: '2' };

      mockCacheManager.get.mockResolvedValue(null);
      mockBlogRepository.findOne.mockResolvedValue(mockBlog);

      await expect(service.remove(id, otherUser)).rejects.toThrow(NotFoundException);
    });
  });
}); 