import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Boom from 'boom';

import setRoutes from './v1-routes';
import IoC from '../../service-containers/v1-ioc';

import { ApiCacheMiddleware } from './middlewares/AppCahceMiddleware';

const start = async () => {
  const container = new IoC({
    log: {
      mode: 'file',
    },
  });
  await container.init();

  const { log, accessLog } = container;
  log.info('V1 API starting');
  log.info(`${(process.env.NODE_ENV || 'development').toUpperCase()} environment detected`);

  // SETUP APP
  const app = new Koa();
  app.use(BodyParser());
  app.context.IoC = container;
  log.info('Webserver loaded');

  // Boom error decorator
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (e.isBoom) {
        ctx.status = e.output.statusCode;
        ctx.body = e.output.payload;
        ctx.response.set(e.output.headers);
      } else {
        IoC.log.error(e);
        ctx.status = Boom.internal().output.statusCode;
        ctx.body = Boom.internal().output.payload;
        ctx.response.set(Boom.internal().output.headers);
      }
    }
  });

  // SETUP MIDDLEWARES
  app.use(async (ctx, next) => {
    accessLog.info('(%s) [%s] %s', ctx.request.headers['x-forwarded-for'] || ctx.request.ip, ctx.request.method, ctx.request.url);
    await next();
  });

  // Cache
  app.use(ApiCacheMiddleware);

  // SETUP ROUTES
  const router = new Router({
    prefix: process.env.V1_PREFIX || '/api/v1',
  });
  setRoutes(router, container);
  log.info('V1 routes loaded');

  // USE ROUTER
  app.use(router.routes()).use(router.allowedMethods());
  log.info('V1 routes applied');

  // LAUNCH SERVER
  const port = process.env.V1_PORT || 8081;

  if (process.env.NODE_ENV !== 'development') {
    app.listen(port, '127.0.0.1');
  } else {
    app.listen(port);
  }

  log.info('V1 Listening to port %s', port);
};

start();
