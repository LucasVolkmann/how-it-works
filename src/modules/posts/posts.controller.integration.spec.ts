import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Post } from '../../domain/entities/post.entity.js';
import { User } from '../../domain/entities/user.entity.js';
import app from '../../app.config.js';
import { signToken } from '../../shared/utils/jwt.utils.js';
import { hashPassword } from '../../shared/utils/password.utils.js';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../../config/data-source.config.js';

describe('PostsController Integration Tests', () => {
  let server: any;
  let testUser1: User;
  let testUser2: User;
  let testPost1: Post;
  let testPost2: Post;
  let authToken1: string;
  let authToken2: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
    server = app.getInstance();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await AppDataSource.getRepository(Post).deleteAll();
    await AppDataSource.getRepository(User).deleteAll();

    const userRepo = AppDataSource.getRepository(User);

    testUser1 = await userRepo.save({
      name: 'Test User 1',
      email: 'user1@test.com',
      passwordHash: await hashPassword('password123'),
    });

    testUser2 = await userRepo.save({
      name: 'Test User 2',
      email: 'user2@test.com',
      passwordHash: await hashPassword('password456'),
    });

    authToken1 = signToken({ userId: testUser1.id });
    authToken2 = signToken({ userId: testUser2.id });

    const postRepo = AppDataSource.getRepository(Post);

    testPost1 = await postRepo.save({
      title: 'Published Post',
      content: 'This is a published post content',
      slug: 'published-post',
      published: true,
      author: testUser1,
    });

    testPost2 = await postRepo.save({
      title: 'Draft Post',
      content: 'This is a draft post content',
      slug: 'draft-post',
      published: false,
      author: testUser1,
    });
  });

  describe('GET /api/posts', () => {
    it('should list only published posts', async () => {
      const response = await request(server)
        .get('/api/posts')
        .expect(StatusCodes.OK);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        title: 'Published Post',
        content: 'This is a published post content',
        slug: 'published-post',
      });
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
      expect(response.body[0]).not.toHaveProperty('id');
      expect(response.body[0]).not.toHaveProperty('published');
    });

    it('should return empty array when no published posts exist', async () => {
      await AppDataSource.getRepository(Post).updateAll({ published: false });

      const response = await request(server)
        .get('/api/posts')
        .expect(StatusCodes.OK);

      expect(response.body).toEqual([]);
    });

    it('should return posts ordered by creation date (newest first)', async () => {
      const postRepo = AppDataSource.getRepository(Post);
      await postRepo.save({
        title: 'Newer Post',
        content: 'This is a newer post content',
        slug: 'newer-post',
        published: true,
        author: testUser1,
        createdAt: new Date(Date.now() + 1000),
      });

      const response = await request(server)
        .get('/api/posts')
        .expect(StatusCodes.OK);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Newer Post');
      expect(response.body[1].title).toBe('Published Post');
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('should return post by slug with author info', async () => {
      const response = await request(server)
        .get('/api/posts/published-post')
        .expect(StatusCodes.OK);

      expect(response.body).toMatchObject({
        title: 'Published Post',
        content: 'This is a published post content',
        slug: 'published-post',
        published: true,
        authorName: 'Test User 1',
        id: testPost1.id,
      });
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(server)
        .get('/api/posts/non-existent-slug')
        .expect(StatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('message', 'Postagem não encontrada');
    });

    it('should validate slug parameter', async () => {
      const response = await request(server)
        .get('/api/posts/ab')
        .expect(StatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return unpublished posts by slug', async () => {
      const response = await request(server)
        .get('/api/posts/draft-post')
        .expect(StatusCodes.OK);

      expect(response.body).toMatchObject({
        title: 'Draft Post',
        slug: 'draft-post',
        published: false,
      });
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post when authenticated', async () => {
      const newPost = {
        title: 'New Test Post',
        content: 'This is the content of the new test post',
        published: true,
      };

      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(newPost)
        .expect(StatusCodes.CREATED);

      expect(response.body).toMatchObject({
        title: newPost.title,
        content: newPost.content,
        published: true,
        slug: 'new-test-post',
        authorName: 'Test User 1',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const savedPost = await AppDataSource.getRepository(Post).findOne({
        where: { slug: 'new-test-post' },
      });
      expect(savedPost).toBeTruthy();
    });

    it('should handle slug collisions by appending numbers', async () => {
      const newPost = {
        title: 'Published Post',
        content: 'Content for the duplicate title post',
      };

      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(newPost)
        .expect(StatusCodes.CREATED);

      expect(response.body.slug).toBe('published-post-1');
    });

    it('should create draft post when published is not specified', async () => {
      const newPost = {
        title: 'Default Draft Post',
        content: 'This should be a draft by default',
      };

      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(newPost)
        .expect(StatusCodes.CREATED);

      expect(response.body.published).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const newPost = {
        title: 'Unauthorized Post',
        content: 'This should not be created',
      };

      await request(server)
        .post('/api/posts')
        .send(newPost)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('should validate request body', async () => {
      const invalidPost = {
        title: 'ab',
        content: 'short',
      };

      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(invalidPost)
        .expect(StatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should handle missing required fields', async () => {
      const incompletePost = {
        title: 'Title without content',
      };

      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(incompletePost)
        .expect(StatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update own post', async () => {
      const updateData = {
        title: 'Updated Post Title',
        content: 'Updated post content with more text',
        published: false,
      };

      const response = await request(server)
        .put(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(updateData)
        .expect(StatusCodes.OK);

      expect(response.body).toMatchObject({
        id: testPost1.id,
        title: updateData.title,
        content: updateData.content,
        published: false,
        slug: 'updated-post-title',
      });

      const updatedPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: testPost1.id },
      });
      expect(updatedPost?.title).toBe(updateData.title);
    });

    it('should update slug when title changes', async () => {
      const response = await request(server)
        .put(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ title: 'Completely New Title' })
        .expect(StatusCodes.OK);

      expect(response.body.slug).toBe('completely-new-title');
    });

    it('should handle slug collision on update', async () => {
      await AppDataSource.getRepository(Post).save({
        title: 'Another Post',
        content: 'Content here',
        slug: 'draft-post-updated',
        published: true,
        author: testUser1,
      });

      const response = await request(server)
        .put(`/api/posts/${testPost2.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ title: 'Draft Post Updated' })
        .expect(StatusCodes.OK);

      expect(response.body.slug).toBe('draft-post-updated-1');
    });

    it('should allow partial updates', async () => {
      const response = await request(server)
        .put(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ published: false })
        .expect(StatusCodes.OK);

      expect(response.body.title).toBe(testPost1.title);
      expect(response.body.content).toBe(testPost1.content);
      expect(response.body.published).toBe(false);
    });

    it("should return 403 when trying to update another user's post", async () => {
      const response = await request(server)
        .put(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ title: 'Hacked Title' })
        .expect(StatusCodes.FORBIDDEN);

      expect(response.body.message).toBe(
        'Você não tem permissão para editar esse post',
      );
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(server)
        .put(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ title: 'New Title' })
        .expect(StatusCodes.NOT_FOUND);

      expect(response.body.message).toBe('Postagem não encontrada');
    });

    it('should validate UUID parameter', async () => {
      await request(server)
        .put('/api/posts/invalid-uuid')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ title: 'New Title' })
        .expect(StatusCodes.BAD_REQUEST);
    });

    it('should validate update data', async () => {
      const response = await request(server)
        .put(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ title: 'ab' })
        .expect(StatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      await request(server)
        .delete(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(StatusCodes.NO_CONTENT);

      const deletedPost = await AppDataSource.getRepository(Post).findOne({
        where: { id: testPost1.id },
      });
      expect(deletedPost).toBeNull();
    });

    it("should return 403 when trying to delete another user's post", async () => {
      const response = await request(server)
        .delete(`/api/posts/${testPost1.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(StatusCodes.FORBIDDEN);

      expect(response.body.message).toBe(
        'Você não tem permissão para remover esse post',
      );

      const post = await AppDataSource.getRepository(Post).findOne({
        where: { id: testPost1.id },
      });
      expect(post).toBeTruthy();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';

      const response = await request(server)
        .delete(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(StatusCodes.NOT_FOUND);

      expect(response.body.message).toBe('Postagem não encontrada');
    });

    it('should return 401 when not authenticated', async () => {
      await request(server)
        .delete(`/api/posts/${testPost1.id}`)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('should validate UUID parameter', async () => {
      await request(server)
        .delete('/api/posts/invalid-uuid')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {});

    it('should handle invalid JSON in request body', async () => {
      const response = await request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken1}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json')
        .expect(StatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });
  });
});
