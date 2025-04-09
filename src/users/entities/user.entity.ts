import { Entity, Column, OneToMany } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../shared/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EDITOR,
  })
  role: UserRole;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];
} 