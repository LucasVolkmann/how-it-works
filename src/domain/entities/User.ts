import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Post } from "./Post.js";
import { BaseEntity } from "./BaseEntity.js";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];
}
