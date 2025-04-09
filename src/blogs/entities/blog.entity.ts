import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';

@Entity()
export class Blog extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array')
  tags: string[];

  @ManyToOne(() => User, (user) => user.blogs)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;
} 