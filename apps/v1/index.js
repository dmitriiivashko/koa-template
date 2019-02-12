/* eslint-disable no-global-assign */
require('dotenv').config();

require = require('esm')(module);
module.exports = require('./v1').default;
/* eslint-enable */
