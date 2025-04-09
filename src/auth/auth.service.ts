import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CustomLogger } from '../shared/logger/logger.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly logger: CustomLogger,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
  
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return null;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
       
        const { password, ...result } = user;
        return result;
      }
      return null;
    
  }

  async login(user: any) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload);
      this.logger.log(`JWT token generated for user: ${user.email}`, 'AuthService');
      return {
        access_token: token,
    }
  }

  async register(createUserDto: CreateUserDto) {
      // Force editor role for registration
      const userWithEditorRole = {
        ...createUserDto,
        role: UserRole.EDITOR
      };
      const user = await this.usersService.create(userWithEditorRole);
      return user;
   
  }
} 