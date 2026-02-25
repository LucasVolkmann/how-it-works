export interface PostListItemOutputDTO {
  createdAt: Date;
  updatedAt: Date;
  content: string;
  title: string;
  slug: string;
}

export interface CompletePostOutputDTO {
  createdAt: Date;
  updatedAt: Date;
  content: string;
  title: string;
  slug: string;
  id: string;
  authorName: string;
  published: boolean;
}
