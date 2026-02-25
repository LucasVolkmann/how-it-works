export interface UserAuthenticatedOutputDTO {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}
