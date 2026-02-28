import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { StatusCodes } from 'http-status-codes';

import { PostsService } from './posts.service.js';

vi.mock('../../shared/utils/slug.js', () => ({
  slugify: vi.fn(),
}));

vi.mock('./posts.mapper.js', () => ({
  default: {
    mapListItemOutputDTOArray: vi.fn(),
    mapCompleteOutputDTO: vi.fn(),
  },
}));

import { slugify } from '../../shared/utils/slug.js';
import PostsMapper from './posts.mapper.js';

const mockedSlugify = slugify as MockedFunction<typeof slugify>;
const mockedMapComplete = PostsMapper.mapCompleteOutputDTO as MockedFunction<
  typeof PostsMapper.mapCompleteOutputDTO
>;

function makePost(overrides: any = {}) {
  return {
    id: 'post-id',
    title: 'Post title',
    content: 'Post content',
    slug: 'post-title',
    published: true,
    author: { id: 'author-id' },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('PostsService — update (extended)', () => {
  let service: PostsService;
  let mockPostRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockPostRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new PostsService(mockPostRepo, mockUserRepo);

    vi.clearAllMocks();
  });

  describe('field mutation', () => {
    it('should persist the updated content value', async () => {
      const post = makePost();
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, { content: 'updated content' });

      expect(mockPostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'updated content' }),
      );
    });

    it('should persist multiple updated fields at once', async () => {
      const post = makePost();
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, {
        content: 'new content',
        published: false,
      });

      expect(mockPostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'new content', published: false }),
      );
    });
  });

  describe('slug regeneration on title change', () => {
    it('should regenerate slug when title changes and new slug is free', async () => {
      const post = makePost({ title: 'Old Title', slug: 'old-title' });
      mockPostRepo.findOne
        .mockResolvedValueOnce(post) // findOne for the post itself
        .mockResolvedValueOnce(null); // slug availability check: free
      mockedSlugify.mockReturnValue('new-title');
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, { title: 'New Title' });

      expect(mockedSlugify).toHaveBeenCalledWith('New Title');
      expect(mockPostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'new-title' }),
      );
    });

    it('should increment slug when the generated slug is already taken by another post', async () => {
      const post = makePost({ title: 'Old Title', slug: 'old-title' });
      const conflictingPost = makePost({ id: 'other-post-id', slug: 'new-title' });

      mockPostRepo.findOne
        .mockResolvedValueOnce(post) // fetch the post to update
        .mockResolvedValueOnce(conflictingPost) // 'new-title' is taken by another post
        .mockResolvedValueOnce(null); // 'new-title-1' is free

      mockedSlugify.mockReturnValue('new-title');
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, { title: 'New Title' });

      expect(mockPostRepo.findOne).toHaveBeenNthCalledWith(2, {
        where: { slug: 'new-title' },
      });
      expect(mockPostRepo.findOne).toHaveBeenNthCalledWith(3, {
        where: { slug: 'new-title-1' },
      });
      expect(mockPostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'new-title-1' }),
      );
    });

    it('should keep the existing slug when the generated slug belongs to the same post', async () => {
      const post = makePost({ title: 'My Title', slug: 'my-title' });

      mockPostRepo.findOne.mockResolvedValueOnce(post).mockResolvedValueOnce(post);

      mockedSlugify.mockReturnValue('my-title');
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, { title: 'My Title' });

      expect(mockPostRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'my-title' }),
      );
      expect(mockPostRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should not call slugify when title is absent from the update payload', async () => {
      const post = makePost();
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, {
        content: 'only content changed',
      });

      expect(mockedSlugify).not.toHaveBeenCalled();
    });

    it('should not call slugify when the new title is identical to the current title', async () => {
      const post = makePost({ title: 'Same Title' });
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.save.mockResolvedValue(undefined);
      mockedMapComplete.mockReturnValue({ id: post.id } as any);

      await service.update('author-id', post.id, { title: 'Same Title' });

      expect(mockedSlugify).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should reject deletion when user is not the author', async () => {
      const post = makePost();
      const wrongUserId = 'wrong-mock-user-id';

      mockPostRepo.findOne.mockResolvedValue(post);

      await expect(service.delete(wrongUserId, post.id)).rejects.toMatchObject({
        status: StatusCodes.FORBIDDEN,
      });
    });
    it('should reject deletion when post not found', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(
        service.delete('mocked-author-id', 'mocked-post-id'),
      ).rejects.toMatchObject({
        status: StatusCodes.NOT_FOUND,
      });
    });
    it('should call repository delete when post exist and it is from same author', async () => {
      const post = makePost();

      mockPostRepo.findOne.mockResolvedValue(post);

      await service.delete(post.author.id, post.id);

      expect(mockPostRepo.remove).toHaveBeenCalledWith(post);
    });
  });
});
