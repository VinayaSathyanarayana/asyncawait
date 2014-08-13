﻿import references = require('references');
import assert = require('assert');
import asyncBuilder = require('../asyncBuilder');
import iterable = require('./iterable/index');
import config = require('../config/index');
export = api;


var api: AsyncAwait.Async.API = <any> function (invokee: Function) {
    assert(arguments.length === 1, 'async: expected a single argument');
    var async = config.options().defaults.async || asyncBuilder;
    return async(invokee);
};
api.mod = function mod(mod) {
    assert(arguments.length === 1, 'async.mod: expected a single argument');
    var async = config.options().defaults.async || asyncBuilder;
    return async.mod(mod);
};




//TODO: temp
api.iterable = iterable;