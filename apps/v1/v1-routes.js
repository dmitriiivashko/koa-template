import {
  getAllOrders,
  errorTest,
} from './endpoints/orders-endpoint';

export default (r, IoC) => { // eslint-disable-line
  r.get('/orders', getAllOrders);
  r.get('/orders/error', errorTest);
};
