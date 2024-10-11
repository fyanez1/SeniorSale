import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface CommentDoc extends BaseDoc {
  item: ObjectId;
  comment: string;
  user: ObjectId;
}

/**
 * concept: Commenting
 */
export default class CommentingConcept {
  public readonly comments: DocCollection<CommentDoc>;

  /**
   * Make an instance of Commenting.
   */
  constructor(collectionName: string) {
    this.comments = new DocCollection<CommentDoc>(collectionName);
  }

  async createComment(item: ObjectId, comment: string, user: ObjectId) {
    const _id = await this.comments.createOne({ item, comment, user });
    return { msg: "Comment successfully created!", comment: await this.comments.readOne({ _id }) };
  }

  async getByItem(item: ObjectId) {
    return await this.comments.readMany({ item });
  }

  async editComment(item: ObjectId, _id: ObjectId, comment?: string) {
    await this.comments.partialUpdateOne({ _id }, { comment });
    return { msg: "Comment successfully edited!" };
  }

  async delete(item: ObjectId, _id: ObjectId) {
    await this.comments.deleteOne({ _id });
    return { msg: "Comment deleted successfully!" };
  }

  async assertCommenterIsUser(item: ObjectId, _id: ObjectId, user: ObjectId) {
    const comment = await this.comments.readOne({ _id });
    if (!comment) {
      throw new NotFoundError(`Comment ${_id} does not exist!`);
    }
    if (comment.user.toString() !== user.toString()) {
      throw new CommentAuthorNotMatchError(user, _id);
    }
  }
}

export class CommentAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of comment {1}!", author, _id);
  }
}
