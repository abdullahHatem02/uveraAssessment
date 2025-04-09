import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { classToPlain } from 'class-transformer';
import { CustomLogger } from '../shared/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    
      const { email, password, ...rest } = createUserDto;

      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser) {
  
        throw new ConflictException('Email already exists');
      }

      const hashCost = this.configService.get<number>('app.hashCost');
      const hashedPassword = await bcrypt.hash(password, hashCost);
      const user = this.usersRepository.create({
        ...rest,
        email,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);
      return classToPlain(savedUser);
    
  }

  async findAll(): Promise<User[]> {
      const users = await this.usersRepository.find();
      return users;
  }

  async findOne(id: string): Promise<User> {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
   
  }

  async findByEmail(email: string): Promise<User> {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.findOne(id);
      Object.assign(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(user);
      return updatedUser;
    
  }

  async remove(id: string): Promise<void> {
      const user = await this.findOne(id);
      await this.usersRepository.remove(user);
  }
} 