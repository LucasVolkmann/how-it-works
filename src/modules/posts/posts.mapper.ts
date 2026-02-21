import type { Post } from '../../domain/entities/post.entity.js';
import type { CompletePostOutputDto, PostListItemOutputDto } from './posts.dtos.js';

export default class PostsMapper {
  static mapListItemOutputDto(post: Post): PostListItemOutputDto {
    return {
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      content: post.content,
      title: post.title,
      slug: post.slug,
    };
  }
  static mapListItemOutputDtoArray(posts: Post[]): PostListItemOutputDto[] {
    return posts.map(PostsMapper.mapListItemOutputDto);
  }
  static mapCompleteOutputDto(post: Post): CompletePostOutputDto {
    if (!post.author) throw new Error('Post without author to return.');
    return {
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      content: post.content,
      title: post.title,
      slug: post.slug,
      authorName: post.author.name,
      published: post.published,
      id: post.id,
    };
  }
}
