/* eslint-disable */
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name: 'api',
      script: 'apps/v1/index.js',
      exec_mode: 'cluster',
      instances: 'max',
      log_type: "json",
    },
  ]
};
