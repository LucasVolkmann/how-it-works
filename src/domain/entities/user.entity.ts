import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Post as PostType } from './post.entity.js';
import { Post } from './post.entity.js';
import { BaseEntity } from './base.entity.js';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts!: PostType[];
}
