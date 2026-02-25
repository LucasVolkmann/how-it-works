import { Post } from '../../domain/entities/post.entity.js';
import { User } from '../../domain/entities/user.entity.js';
import type { CreatePostDTO, UpdatePostDTO } from './posts-schemas.dto.js';
import { slugify } from '../../shared/utils/slug.js';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import type { CompletePostOutputDTO, PostListItemOutputDTO } from './posts.dto.js';
import PostsMapper from './posts.mapper.js';
import type { Repository } from 'typeorm';

export class PostsService {
  constructor(
    private postRepo: Repository<Post>,
    private userRepo: Repository<User>,
  ) {}

  async listPublished(): Promise<PostListItemOutputDTO[]> {
    const outputAttributesArray: (keyof PostListItemOutputDTO)[] = [
      'title',
      'content',
      'slug',
      'createdAt',
      'updatedAt',
    ];
    const posts = await this.postRepo.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
      select: outputAttributesArray,
    });
    return PostsMapper.mapListItemOutputDTOArray(posts);
  }

  async getBySlug(slug: string): Promise<PostListItemOutputDTO> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post)
      throw createHttpError(StatusCodes.NOT_FOUND, 'Postagem não encontrada');
    return PostsMapper.mapCompleteOutputDTO(post);
  }

  async create(
    authorId: string,
    data: CreatePostDTO,
  ): Promise<CompletePostOutputDTO> {
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author)
      throw createHttpError(StatusCodes.NOT_FOUND, 'Autor não encontrado');

    const baseSlug = slugify(data.title);
    let slug = baseSlug;

    let existing = await this.postRepo.findOne({ where: { slug } });
    let count = 1;
    while (existing) {
      slug = `${baseSlug}-${count++}`;
      existing = await this.postRepo.findOne({ where: { slug } });
    }

    const post = this.postRepo.create({
      title: data.title,
      content: data.content,
      slug,
      published: data.published ?? false,
      author,
    });

    await this.postRepo.save(post);
    return PostsMapper.mapCompleteOutputDTO(post);
  }

  async update(
    authorId: string,
    id: string,
    data: UpdatePostDTO,
  ): Promise<CompletePostOutputDTO> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post)
      throw createHttpError(StatusCodes.NOT_FOUND, 'Postagem não encontrada');
    if (post.author.id !== authorId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        'Você não tem permissão para editar esse post',
      );
    }

    if (data.title && data.title !== post.title) {
      const baseSlug = slugify(data.title);
      let slug = baseSlug;
      let existing = await this.postRepo.findOne({ where: { slug } });
      let count = 1;
      while (existing && existing.id !== post.id) {
        slug = `${baseSlug}-${count++}`;
        existing = await this.postRepo.findOne({ where: { slug } });
      }
      post.slug = slug;
    }

    Object.assign(post, data);

    await this.postRepo.save(post);
    return PostsMapper.mapCompleteOutputDTO(post);
  }

  async delete(authorId: string, id: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post)
      throw createHttpError(StatusCodes.NOT_FOUND, 'Postagem não encontrada');
    if (post.author.id !== authorId) {
      throw createHttpError(
        StatusCodes.FORBIDDEN,
        'Você não tem permissão para remover esse post',
      );
    }
    await this.postRepo.remove(post);
  }
}
