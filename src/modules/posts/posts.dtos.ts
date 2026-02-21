export interface PostListItemOutputDto {
  createdAt: Date;
  updatedAt: Date;
  content: string;
  title: string;
  slug: string;
}

export interface CompletePostOutputDto {
  createdAt: Date;
  updatedAt: Date;
  content: string;
  title: string;
  slug: string;
  id: string;
  authorName: string;
  published: boolean;
}
