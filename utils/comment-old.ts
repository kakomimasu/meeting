import { User } from "@/utils/types.ts";

export class Comment {
  id;
  created_at;
  is_deleted;

  constructor(
    public user: User,
    public message: string,
  ) {
    this.id = crypto.randomUUID().toString();
    this.user = user;
    this.message = message;
    this.created_at = new Date();
    this.is_deleted = false;
  }

  delete() {
    this.is_deleted = true;
  }

  get getId() {
    return this.id;
  }
  get getUser() {
    return this.user;
  }
  get getMessage() {
    return this.message;
  }
  get getCreatedAt() {
    return this.created_at;
  }
  get isDeleted() {
    return this.is_deleted;
  }
}
