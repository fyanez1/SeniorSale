import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface SellDoc extends BaseDoc {
  seller: ObjectId;
  name: string;
  cost: number;
  description: string;
  pictures: Array<BinaryData>;
  contact: string;
}

/**
 * concept: Selling [Seller]
 */
export default class SellingConcept {
  public readonly items: DocCollection<SellDoc>;

  /**
   * Make an instance of Selling.
   */
  constructor(collectionName: string) {
    this.items = new DocCollection<SellDoc>(collectionName);
  }

  async create(seller: ObjectId, name: string, cost: number, description: string, pictures: Array<BinaryData>, contact: string) {
    const _id = await this.items.createOne({ seller, name, cost, description, pictures, contact });
    return { msg: "Item put up for sale successfully!", item: await this.items.readOne({ _id }) };
  }

  async getItems() {
    // Returns all items being sold! You might want to page for better client performance
    return await this.items.readMany({}, { sort: { _id: -1 } });
  }

  async getBySeller(seller: ObjectId) {
    return await this.items.readMany({ seller });
  }

  async update(_id: ObjectId, name?: string, cost?: number, description?: string, pictures?: Array<BinaryData>, contact?: string) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.items.partialUpdateOne({ _id }, { name, cost, description, pictures, contact });
    return { msg: "Item successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.items.deleteOne({ _id });
    return { msg: "Item is no longer up for sale!" };
  }

  async assertSellerIsUser(_id: ObjectId, user: ObjectId) {
    const item = await this.items.readOne({ _id });
    if (!item) {
      throw new NotFoundError(`Item ${_id} does not exist!`);
    }
    if (item.seller.toString() !== user.toString()) {
      throw new ItemSellerNotMatchError(user, _id);
    }
  }
}

export class ItemSellerNotMatchError extends NotAllowedError {
  constructor(
    public readonly seller: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the seller of item {1}!", seller, _id);
  }
}
