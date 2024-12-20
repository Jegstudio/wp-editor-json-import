const configs = require('./webpack.config.dev');

module.exports = {
    ...configs,
    mode: 'production'
};