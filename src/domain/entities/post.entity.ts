import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { User as UserType } from './user.entity.js';
import { User } from './user.entity.js';
import { BaseEntity } from './base.entity.js';

@Entity('posts')
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  @ManyToOne(() => User, (user) => user.posts)
  author!: UserType;
}
