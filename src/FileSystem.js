"use strict";

// adapted from vs/base/common/async
function nfcall(fn, ...args) {
    return new Promise((c, e) => fn(...args, (err, result) => err ? e(err) : c(result)));
}

module.exports = {
    nfcall
};