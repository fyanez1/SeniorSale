import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface SellDoc extends BaseDoc {
  user: ObjectId;
  name: string;
  cost: number;
  description: string;
  pictures: Array<BinaryData>;
  contact: string;
  queue: Array<ObjectId>;
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

  async create(user: ObjectId, name: string, cost: number, description: string, pictures: Array<BinaryData>, contact: string) {
    const _id = await this.items.createOne({ user, name, cost, description, pictures, contact, queue: [] });
    return { msg: "Item put up for sale successfully!", item: await this.items.readOne({ _id }) };
  }

  async getItems() {
    // Returns all items being sold! You might want to page for better client performance
    return await this.items.readMany({}, { sort: { _id: -1 } });
  }

  async getBySeller(user: ObjectId) {
    return await this.items.readMany({ user });
  }

  async update(_id: ObjectId, name?: string, cost?: number, description?: string, pictures?: Array<BinaryData>, contact?: string) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.items.partialUpdateOne({ _id }, { name, cost, description, pictures, contact });
    return { msg: "Item successfully updated!" };
  }

  // returns -1 if buyer is not on the queue
  async getQueuePosition(itemId: ObjectId, buyer: ObjectId) {
    const queue: Array<ObjectId> = await this.getItemQueue(itemId);
    let position = -1;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].equals(buyer)) {
        position = i;
      }
    }
    return position + 1;
  }

  async getItemQueue(itemId: ObjectId) {
    const item = await this.items.readOne({ _id: itemId });
    if (!item) {
      throw new NotFoundError(`Item ${itemId} does not exist!`);
    } else {
      console.log("item queue:", item.queue);
      return item.queue;
    }
  }

  async claimItem(itemId: ObjectId, buyer: ObjectId) {
    const queue: Array<ObjectId> = await this.getItemQueue(itemId);
    let doesntExist = true;
    for (const b of queue) {
      if (b.equals(buyer)) {
        doesntExist = false;
      }
    }
    if (doesntExist) {
      queue.push(buyer);
      await this.items.partialUpdateOne({ _id: itemId }, { queue: queue });
    }
  }

  async unclaimItem(itemId: ObjectId, buyer: ObjectId) {
    const queue: Array<ObjectId> = await this.getItemQueue(itemId);
    const newQueue: Array<ObjectId> = [];
    for (const b of queue) {
      if (!b.equals(buyer)) {
        newQueue.push(b);
      }
    }
    await this.items.partialUpdateOne({ _id: itemId }, { queue: newQueue });
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
    if (item.user.toString() !== user.toString()) {
      throw new ItemSellerNotMatchError(user, _id);
    }
  }
}

export class ItemSellerNotMatchError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the user of item {1}!", user, _id);
  }
}
