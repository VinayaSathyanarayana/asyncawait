﻿///<reference path="../src/_refs.d.ts" />
import chai = require('chai');
import Promise = require('bluebird');
import async = require('asyncawait/async');
import await = require('asyncawait/await');
import yield_ = require('asyncawait/yield');
var expect = chai.expect;


describe('async.iterable.thunk(...)', () => {

    var foo = async.iterable.thunk ((count: number, accum?: any[]) => {
        if (count < 1 || count > 9) throw new Error('out of range');
        for (var i = 1; i <= count; ++i) {
            if (accum) accum.push(111 * i);
            yield_ (111 * i);
        }
        return 'done';
    });


    describe('returns a function', () => {

        it('which returns an async iterator with next() and forEach() methods', () => {
            var syncResult = foo();
            expect(syncResult).is.an('object');
            expect(syncResult.next).is.a('function');
            expect(syncResult.forEach).is.a('function');
        });
    });


    describe('provides an iterator whose next() method', () => {

        it('synchronously returns a thunk', () => {
            var iter = foo(3);
            var syncResult = iter.next();
            expect(syncResult).instanceOf(Function);
            expect(syncResult.length).to.equal(1);
        });

        it('does not execute if the thunk is not invoked', done => {
            var arr = [], thunk = foo(3, arr).next();
            Promise.delay(50)
            .then(() => expect(arr).to.be.empty)
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('executes its definition asynchronously', done => {
            var arr = [], iter = foo(3, arr), next = () => Promise.promisify(iter.next())();
            next()
            .then(result => expect(arr).to.deep.equal([111]))
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('eventually resolves with the definition\'s yielded value', async.cps (() => {
            var iter = foo(3), next = () => Promise.promisify(iter.next())();
            expect(await (next())).to.deep.equal({ done: false, value: 111 });
            expect(await (next())).to.deep.equal({ done: false, value: 222 });
            expect(await (next())).to.deep.equal({ done: false, value: 333 });
            expect(await (next())).to.deep.equal({ done: true, value: 'done' });
        }));

        it('eventually rejects with the definition\'s thrown value', async.cps (() => {
            var err, iter = foo(20), next = () => Promise.promisify(iter.next())();
            expect(() => await (next())).to.throw(Error, 'out of range');
        }));

        it('eventually rejects if the iteration is already finished', async.cps(() => {
            var err, iter = foo(1), next = () => Promise.promisify(iter.next())();
            expect(await (next())).to.deep.equal({ done: false, value: 111 });
            expect(await (next())).to.deep.equal({ done: true, value: 'done' });
            expect(() => await (next())).to.throw(Error);
        }));
    });


    describe('provides an iterator whose forEach() method', () => {

        function nullFunc() { }

        it('expects a single callback as its argument', () => {
            expect(() => (<any> foo(3)).forEach()).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1)).to.throw(Error);
            expect(() => (<any> foo(3)).forEach(1, nullFunc)).to.throw(Error);
        });

        it('synchronously returns a thunk', () => {
            var iter = foo(3);
            var syncResult = iter.forEach(nullFunc);
            expect(syncResult).instanceOf(Function);
            expect(syncResult.length).to.equal(1);
        });

        it('does not execute if the thunk is not invoked', done => {
            var arr = [], thunk = foo(3, arr).forEach(nullFunc);
            Promise.delay(50)
            .then(() => expect(arr).to.be.empty)
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('executes its definition asynchronously', done => {
            var arr = [], iter = foo(3, arr), forEach = cb => Promise.promisify(iter.forEach(cb))();
            forEach(nullFunc)
            .then(result => expect(arr).to.deep.equal([111, 222, 333]))
            .then(() => done())
            .catch(done);
            expect(arr).to.be.empty;
        });

        it('iterates over all yielded values', async.cps(() => {
            var arr = [], iter = foo(4), forEach = cb => Promise.promisify(iter.forEach(cb))();
            await (forEach(val => arr.push(val)));
            expect(arr).to.deep.equal([111, 222, 333, 444]);
        }));

        it('eventually resolves with the definition\'s returned value', async.cps(() => {
            var arr = [], iter = foo(7, arr), forEach = cb => Promise.promisify(iter.forEach(cb))();
            var result = await (forEach(nullFunc));
            expect(result).to.equal('done');
            expect(arr.length).to.equal(7);
        }));

        it('eventually rejects with the definition\'s thrown value', async.cps(() => {
            var err, iter = foo(20), forEach = cb => Promise.promisify(iter.forEach(cb))();
            expect(() => await (forEach(nullFunc))).to.throw(Error, 'out of range');
        }));

        it('eventually rejects if the iteration is already finished', async.cps(() => {
            var err, iter = foo(1), forEach = cb => Promise.promisify(iter.forEach(cb))();
            await (forEach(nullFunc));
            expect (() => await (forEach(nullFunc))).to.throw(Error);
        }));
    });
});
