﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var _ = require('lodash');
var Promise = require('bluebird');
var Coro = require('../coro');

var IterableCpsCoro = (function (_super) {
    __extends(IterableCpsCoro, _super);
    function IterableCpsCoro() {
        _super.call(this);
        this.nextCallback = null;
    }
    IterableCpsCoro.prototype.invoke = function (func, this_, args) {
        _super.prototype.invoke.call(this, func, this_, args);
        return new AsyncIterator(this);
    };

    IterableCpsCoro.prototype.invokeNext = function (callback) {
        var _this = this;
        this.nextCallback = callback;
        setImmediate(function () {
            return _this.done ? callback(new Error('iterated past end')) : _this.resume();
        });
    };

    IterableCpsCoro.prototype.return = function (result) {
        this.done = true;
        this.nextCallback(null, { done: true, value: result });
    };

    IterableCpsCoro.prototype.throw = function (error) {
        this.nextCallback(error);
    };

    IterableCpsCoro.prototype.yield = function (value) {
        var result = { done: false, value: value };
        this.nextCallback(null, result);
        this.suspend();
    };
    return IterableCpsCoro;
})(Coro);

var AsyncIterator = (function () {
    function AsyncIterator(iterable) {
        this.iterable = iterable;
    }
    AsyncIterator.prototype.next = function (callback) {
        return this.iterable.invokeNext(callback || nullFunc);
    };

    AsyncIterator.prototype.forEach = function (callback, done_) {
        var _this = this;
        // Ensure at least one argument has been supplied, which is a function.
        if (arguments.length < 1)
            throw new Error('forEach(): expected at least one argument');
        if (!_.isFunction(callback))
            throw new Error('forEach(): expected argument to be a function');

        var result = Promise.defer();
        var done = done_ || nullFunc;
        var stepNext = function () {
            return _this.next(function (err, item) {
                return err ? done(err) : stepResolved(item);
            });
        };
        var stepResolved = function (item) {
            if (item.done)
                return done(null, item.value);
            callback(item.value);
            setImmediate(stepNext);
        };
        stepNext();
    };
    return AsyncIterator;
})();

function nullFunc() {
}
module.exports = IterableCpsCoro;
//# sourceMappingURL=iterable.cps.js.map
