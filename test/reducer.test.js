import 'babel-polyfill';
import expect from 'expect.js';

import Queued from '../lib/queue.js';

describe('Queued composer', function () {

    function getReducer() {
        let initialState = {
            val: '0'
        };
        let reducer = function (state = initialState, action) {
            if (action && action.type == 'MY_ACTION') {
                return Object.assign(state, {
                    val: state.val + action.val
                });
            }
            return state;
        };
        return Queued(reducer);
    }

    it('should pass through initial state', function () {
        /* Given */
        let reducer = getReducer();

        /* When */
        let state = reducer();

        /* Then */
        expect(state.val).to.be('0');
    });

    it('should apply initial action', function () {
        /* Given */
        let action = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, action);

        /* Then */
        expect(result.val).to.be('01');
    });

    it('should apply secondary action', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);

        /* Then */
        expect(result.val).to.be('012');
    });

    it('should apply result of initial action', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: first
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);
        result = reducer(result, firstResult);

        /* Then */
        expect(result.val).to.be('01a2');
    });

    it('should apply result of initial and secondary action', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: first
        };
        let secondResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'b',
            parent: second
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);
        result = reducer(result, firstResult);
        result = reducer(result, secondResult);

        /* Then */
        expect(result.val).to.be('01a2b');
    });

    it('should apply result of initial and secondary action independent of order of arrival', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: first
        };
        let secondResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'b',
            parent: second
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);
        result = reducer(result, secondResult);
        result = reducer(result, firstResult);

        /* Then */
        expect(result.val).to.be('01a2b');
    });

    it('should apply result of initial and secondary action independent of order of execution', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: first
        };
        let secondResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'b',
            parent: second
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, firstResult);
        result = reducer(result, second);
        result = reducer(result, secondResult);

        /* Then */
        expect(result.val).to.be('01a2b');
    });

    it('should ignore actions thrown with invalid parent', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: {/* Wut */}
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, firstResult);

        /* Then */
        expect(result.val).to.be('01');
    });
    it('should revert state when action errors', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            failed: true,
            val: 'a',
            parent: first
        };


        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);
        result = reducer(result, firstResult);

        /* Then */
        expect(result.val).to.be('0');
    });

    it('should revert state when action errors for secondary action', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'a',
            parent: first
        };
        let secondResult = {
            type: 'MY_ACTION',
            queued: true,
            failed: true,
            val: 'b',
            parent: second
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, second);
        result = reducer(result, firstResult);
        result = reducer(result, secondResult);

        /* Then */
        expect(result.val).to.be('01a');
    });

    it('should continue applying actions after an error', function () {
        /* Given */
        let first = {
            type: 'MY_ACTION',
            queued: true,
            val: '1'
        };
        let second = {
            type: 'MY_ACTION',
            queued: true,
            val: '2'
        };
        let firstResult = {
            type: 'MY_ACTION',
            queued: true,
            failed: true,
            val: 'a',
            parent: first
        };
        let secondResult = {
            type: 'MY_ACTION',
            queued: true,
            val: 'b',
            parent: second
        };

        let reducer = getReducer();
        let state = reducer();

        /* When */
        let result = reducer(state, first);
        result = reducer(result, firstResult);
        result = reducer(result, second);
        result = reducer(result, secondResult);

        /* Then */
        expect(result.val).to.be('02b');
    });

});