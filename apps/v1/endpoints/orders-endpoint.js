import Boom from 'boom';

export const getAllOrders = async (ctx) => {
  const { ordersRepository } = ctx.IoC;

  const orders = await ordersRepository.getAllOrders();

  ctx.body = {
    orders: orders.map(o => o.output()),
  };
};

export const errorTest = async () => {
  throw Boom.internal('This is a test 500 error');
};
