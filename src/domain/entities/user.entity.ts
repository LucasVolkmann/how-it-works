import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Post as PostType } from './post.entity.js';
import { Post } from './post.entity.js';
import { BaseEntity } from './base.entity.js';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts!: PostType[];
}
