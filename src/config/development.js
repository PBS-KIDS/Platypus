/* global module, require */
const pkg = require('../../package.json');

module.exports = {
    dev: true,
    buildDate: new Date().toGMTString(),
    version: pkg.version + '-dev'
};