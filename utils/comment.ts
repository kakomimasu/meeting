import { User } from "@/utils/database.ts";

export class Comment {
  deleted = false;
  id = new Date().getTime(); // UNIX時間のミリ秒
  sentAt = new Date();

  constructor(
    public user: User,
    public message: string,
  ) {}

  delete() {
    this.deleted = true;
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
  get getSentAt() {
    return this.sentAt;
  }
  get isDeleted() {
    return this.deleted;
  }
}
