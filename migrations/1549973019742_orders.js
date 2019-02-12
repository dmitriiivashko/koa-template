exports.up = (pgm) => {
  pgm.createTable('orders', {
    id: { type: 'serial' },
    internalId: { type: 'int', notNull: true },
    uuid: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    address: { type: 'text', notNull: true },
    price: { type: 'float', notNull: true, default: 0 },
    data: { type: 'jsonb', notNull: true, default: '{}' },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('orders');
};
