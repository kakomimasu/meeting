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
  contentType?: string;
  ogp?: Ogp;
  groupId: string;
}

export interface Ogp {
  title: string;
  description: string;
  imageUrl: string;
}

export interface State {
  user: User | null;
}

export interface Group {
  id: string;
  name: string;
}
