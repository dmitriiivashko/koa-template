import { get } from 'lodash';
import Knex from 'knex';
import path from 'path';
import Redis from 'redis';
import { promisify } from 'util';
import Winston from 'winston';
import 'winston-daily-rotate-file';
import CoreIoC from '../libs/CoreIoC';

// Repositories
import OrdersRepository from '../repositories/orders-repository';

// Services
import DemoService from '../services/demo-service';

export default class IoCv1 extends CoreIoC {
  async init() {
    await this._initLoggers();
    await this._initRedis();
    await this._initDb();
    await this._initRepositories();
    await this._initServices();
  }

  /**
   * Setup loggers
   */
  async _initLoggers() {
    const logTransports = [];
    const accessLogTransports = [];

    const mode = get(this.settings, 'log.mode', 'console');
    const enableAccessLogs = get(this.settings, 'log.access', true);
    const name = get(this.properties, 'log.name', 'v1');

    if (mode === 'console' || process.env.NODE_ENV !== 'production') {
      logTransports.push(new Winston.transports.Console({ timestamp: true, colorize: true }));
      accessLogTransports.push(new Winston.transports.Console({ timestamp: true, colorize: true }));
    }

    if (mode === 'file' || process.env.NODE_ENV === 'production') {
      logTransports.push(new (Winston.transports.DailyRotateFile)({
        filename: `${name}-%DATE%.log`,
        dirname: path.resolve(__dirname, '..', 'logs'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxSize: '500m',
        maxFiles: '14d',
      }));
      if (enableAccessLogs) {
        accessLogTransports.push(new (Winston.transports.DailyRotateFile)({
          filename: `${name}-access-%DATE%.log`,
          dirname: path.resolve(__dirname, '..', 'logs'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '500m',
          maxFiles: '14d',
        }));
      }
    }

    this.register({
      name: 'log',
      instance: new Winston.Logger({
        level: process.env.LOG_LEVEL || 'debug',
        transports: logTransports,
      }),
    });

    this.register({
      name: 'accessLog',
      instance: new Winston.Logger({
        level: process.env.LOG_LEVEL || 'debug',
        transports: accessLogTransports,
      }),
    });
  }

  async _initRedis() {
    this.log.info('Connecting to Redis');
    const redisClient = Redis.createClient();
    this.log.info('Connected to Redis');

    redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
    redisClient.delAsync = promisify(redisClient.del).bind(redisClient);
    redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
    redisClient.flushdbAsync = promisify(redisClient.flushdb).bind(redisClient);
    redisClient.evalAsync = promisify(redisClient.eval).bind(redisClient);
    redisClient.decrAsync = promisify(redisClient.decr).bind(redisClient);

    this.register({
      name: 'redis',
      instance: redisClient,
    });
  }

  /**
   * Setup db connection(s)
   */
  async _initDb() {
    const connectionUrl = process.env.DATABASE_URL || '';

    const poolMinConf = parseInt(process.env.DB_POOL_MIN || 1, 10);
    const poolMaxConf = parseInt(process.env.DB_POOL_MAX || 1, 10);

    this.register({
      name: 'db',
      instance: Knex({
        client: 'pg',
        connection: connectionUrl,
        pool: {
          min: poolMinConf,
          max: poolMaxConf,
          afterCreate: (connection, callback) => {
            connection.query('SET timezone = UTC;', (err) => {
              callback(err, connection);
            });
          },
        },
        debug: process.env.DB_DEBUG === 'true',
      }),
    });
    this.log.info('Connected to database: %s (pool min:%d max:%d)', connectionUrl, poolMinConf, poolMaxConf);
  }

  async _initRepositories() {
    this.register({ name: 'ordersRepository', instance: new OrdersRepository(this) });
  }

  async _initServices() {
    this.register({ name: 'demoService', instance: new DemoService(this) });
  }
}
