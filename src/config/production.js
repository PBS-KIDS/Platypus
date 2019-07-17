/* global module, require */
const pkg = require('../../package.json');

module.exports = {
    dev: false,
    buildDate: new Date().toGMTString(),
    version: pkg.version
};