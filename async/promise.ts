﻿import references = require('references');
import oldBuilder = require('../src/asyncBuilder');
import protocol = require('../src/protocols/promise');
export = newBuilder;


var newBuilder = oldBuilder.mod<AsyncAwait.Async.PromiseBuilder>(protocol);