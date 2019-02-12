import CoreModel from '../libs/CoreModel';

export default class Order extends CoreModel {
  constructor() {
    super();

    this.id = null;
    this.internalId = null;
    this.uuid = null;
    this.name = null;
    this.address = null;
    this.price = null;
  }

  whitelisted() {
    return [
      'id',
      'name',
      'price',
    ];
  }
}
