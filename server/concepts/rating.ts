import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UpvoteDoc extends BaseDoc {
  seller: ObjectId;
  item: ObjectId;
  rater: ObjectId;
  rating: number;
}

/**
 * concept: Rating
 */
export default class RatingConcept {
  public readonly ratings: DocCollection<UpvoteDoc>;

  /**
   * Make an instance of Rating.
   */
  constructor(collectionName: string) {
    this.ratings = new DocCollection<UpvoteDoc>(collectionName);
  }

  // averages all the ratings
  async getRating(seller: ObjectId) {
    const ratings = await this.ratings.readMany({ seller });
    let total = 0;
    for (const rating of ratings) {
      total += Number(rating.rating);
    }
    const averageRating = total / ratings.length;
    if (total == 0) {
      return 0;
    }
    return averageRating;
  }

  async rate(seller: ObjectId, item: ObjectId, rater: ObjectId, rating: number) {
    const _id = await this.ratings.createOne({ seller, item, rater, rating });
    return { msg: "Seller successfully rated!", rating: await this.ratings.readOne({ _id }) };
  }

  async changeRating(seller: ObjectId, item: ObjectId, rater: ObjectId, rating: number) {
    await this.ratings.partialUpdateOne({ seller: seller, item: item, rater: rater }, { rating });
    return { msg: "Post successfully updated!" };
  }

  async assertRaterIsUser(user: ObjectId, seller: ObjectId, item: ObjectId) {
    const ratingObject = await this.ratings.readOne({ seller: seller, item: item });
    if (!ratingObject) {
      throw new NotFoundError(`User does not exist!`);
    }
    if (ratingObject.rater.toString() !== user.toString()) {
      throw new RaterNotMatchError(ratingObject.rater, user);
    }
  }
}

export class RaterNotMatchError extends NotAllowedError {
  constructor(
    public readonly rater: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} cannot rate {1}!", rater, _id);
  }
}
