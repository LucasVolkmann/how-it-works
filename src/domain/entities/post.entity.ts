import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity.js';
import { BaseEntity } from './base.entity.js';

@Entity('posts')
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ default: false })
  published!: boolean;

  @ManyToOne(() => User, (user) => user.posts)
  author!: User;
}
