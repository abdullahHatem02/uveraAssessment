import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../users/entities/user.entity';

describe('BlogsController', () => {
  let controller: BlogsController;
  let blogsService: BlogsService;

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

  const mockBlogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BlogsController>(BlogsController);
    blogsService = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog post', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        tags: ['test'],
      };

      mockBlogsService.create.mockResolvedValue(mockBlog);

      const result = await controller.create(createBlogDto, { user: mockUser });

      expect(result).toEqual(mockBlog);
      expect(blogsService.create).toHaveBeenCalledWith(createBlogDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all blog posts with pagination', async () => {
      const page = 1;
      const limit = 10;
      const tags = ['test'];

      mockBlogsService.findAll.mockResolvedValue([mockBlog]);

      const result = await controller.findAll(page, limit, tags);

      expect(result).toEqual([mockBlog]);
      expect(blogsService.findAll).toHaveBeenCalledWith(page, limit, tags);
    });

    it('should return all blog posts without pagination', async () => {
      mockBlogsService.findAll.mockResolvedValue([mockBlog]);

      const result = await controller.findAll();

      expect(result).toEqual([mockBlog]);
      expect(blogsService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a blog post by id', async () => {
      const id = '1';

      mockBlogsService.findOne.mockResolvedValue(mockBlog);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockBlog);
      expect(blogsService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a blog post', async () => {
      const id = '1';
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog',
      };

      mockBlogsService.update.mockResolvedValue({ ...mockBlog, ...updateBlogDto });

      const result = await controller.update(id, updateBlogDto, { user: mockUser });

      expect(result).toEqual({ ...mockBlog, ...updateBlogDto });
      expect(blogsService.update).toHaveBeenCalledWith(id, updateBlogDto, mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a blog post', async () => {
      const id = '1';

      mockBlogsService.remove.mockResolvedValue(mockBlog);

      const result = await controller.remove(id, { user: mockUser });

      expect(result).toEqual(mockBlog);
      expect(blogsService.remove).toHaveBeenCalledWith(id, mockUser);
    });
  });
}); 