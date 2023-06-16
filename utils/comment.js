export class Comment {
  constructor(user, message) {
    this.user = user;
    this.message = message;
    this.deleted = false;

    this.id = new Date().getTime(); // UNIX時間のミリ秒
    this.sentAt = new Date();
  }
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
