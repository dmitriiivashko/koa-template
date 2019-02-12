export default class DemoService {
  constructor({ log }) {
    this.log = log;

    log.info('Demo service loaded');
    log.info('Demo service is available as `ctx.IoC.demoService`');
  }
}
