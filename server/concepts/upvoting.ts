import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface UpvoteDoc extends BaseDoc {
  seller: string;
  numUpvotes: number;
}

/**
 * concept: Upvoting
 */
export default class UpvotingConcept {
  public readonly upvotes: DocCollection<UpvoteDoc>;

  /**
   * Make an instance of Upvoting.
   */
  constructor(collectionName: string) {
    this.upvotes = new DocCollection<UpvoteDoc>(collectionName);
  }

  async getNumUpvotes(seller: string) {
    // Returns the number of upvotes that the seller has! You might want to page for better client performance
    const numUpvotes = await this.upvotes.readMany({ seller });
    if (!numUpvotes) {
      return 0;
    }
    return numUpvotes[0].numUpvotes;
  }

  async upvote(upvoter: ObjectId, seller: string) {
    let numUpvotes = await this.getNumUpvotes(seller);
    numUpvotes += 1;
    await this.upvotes.partialUpdateOne({ seller }, { numUpvotes });
    return { msg: "Sucessfully upvoted seller", upvotes: await this.getNumUpvotes(seller) };
  }

  async downvote(upvoter: ObjectId, seller: string) {
    let numUpvotes = await this.getNumUpvotes(seller);
    numUpvotes -= 1;
    await this.upvotes.partialUpdateOne({ seller }, { numUpvotes });
    return { msg: "Sucessfully removed upvote from seller", upvotes: await this.getNumUpvotes(seller) };
  }

//   async assertUpvoterIsUser(user: ObjectId, expectedUser: ObjectId) {
//     const upvoteObject = await this.upvotes.readOne({ user });
//     if (!upvoteObject) {
//       throw new NotFoundError(`User does not exist!`);
//     }
//     if (upvoteObject.seller.toString() !== expectedUser.toString()) {
//       throw new UpvoterNotMatchError(expectedUser, user);
//     }
//   }
// }

// export class UpvoterNotMatchError extends NotAllowedError {
//   constructor(
//     public readonly seller: ObjectId,
//     public readonly _id: ObjectId,
//   ) {
//     super("{0} cannot upvote {1}!", seller, _id);
//   }
// }
