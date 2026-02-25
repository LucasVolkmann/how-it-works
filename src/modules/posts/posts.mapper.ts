import type { Post } from '../../domain/entities/post.entity.js';
import type { CompletePostOutputDTO, PostListItemOutputDTO } from './posts.dto.js';

export default class PostsMapper {
  static mapListItemOutputDTO(post: Post): PostListItemOutputDTO {
    return {
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      content: post.content,
      title: post.title,
      slug: post.slug,
    };
  }
  static mapListItemOutputDTOArray(posts: Post[]): PostListItemOutputDTO[] {
    return posts.map(PostsMapper.mapListItemOutputDTO);
  }
  static mapCompleteOutputDTO(post: Post): CompletePostOutputDTO {
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
