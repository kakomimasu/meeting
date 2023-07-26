export interface User {
  id: string;
  login: string;
  avatarUrl: string;
  name: string;
}

export interface Comment {
  id: string;
  user: User;
  message: string;
  createdAt: Date;
  isDeleted: boolean;
  fileId?: string;
}
