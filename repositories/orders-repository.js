import CoreRepository from '../libs/CoreRepository';
import Order from '../models/order';

export default class OrdersRepository extends CoreRepository {
  async getAllOrders() {
    const items = await this.db('orders').select();
    return items.map(o => Order.fromObject(o));
  }
}
