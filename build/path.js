/* global module */
module.exports = {
    path: function (str) {
        'use strict';

        return  str.substr(str.lastIndexOf("/") + 1);
    }
};
