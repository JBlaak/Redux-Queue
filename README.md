Redux-Queue
====

[![Build Status](https://travis-ci.org/JBlaak/Redux-Queue.svg?branch=master)](https://travis-ci.org/JBlaak/Redux-Queue)

Higher order reducer to easily cope with async actions.

Note! This still is in active development!

Example
----

Managing state while responses will arrive asynchronously back to you is hard. Imagine the following scenario:

Dispatch action `1`, user continues and action `2` is dispatched, meanwhile you're syncing state with the server
so you get the response from action `1` back, lets call this `a`. So now the order of dispatched actions on your reducer
is as follows:

`1 -> 2 -> a`

Ok, so if I apply my server state `a` on top of `2` this might result in weird unexpected glitches in the resulting
 state, god forbid the initial request fails and we're left with an out-of-sync state. What we want is:
 
`1 -> a -> 2`

But without having to block user interaction while w'ere syncing state with, for example, a server. This is where the
Redux-Queue comes into play. 

It will save all applied actions and prior states so it will always be able to "inject" the server response in between
two other actions as well as reverting local changes when a prior request fails.

Usage
----

Set-up by wrapping your regular reducers with the Queue:

```javascript
import {combineReducers} from 'redux'
import Queue from 'redux-queue';

let reducers = combineReducers({
    entries: Queue(entries)
});
```

Dispatch actions which announce they are queued (including [Redux Thunk](https://github.com/gaearon/redux-thunk)):

```javascript
function doSomething() {
    return dispatch => {
        let action = {
            type: MY_ACTION,
            queued: true
        };
        dispatch(action);
        
        setTimeout(() => {
            dispatch({
                type: MY_ACTION_ERROR,
                queued: true,
                parent: action
            });
        }, 1000);
    };
}
```

No matter what happens in between `MY_ACTION` and `MY_ACTION_SUCCESS` these will always be executed in order on
the entries reducer.

So what to do on failure? Here you go:

```javascript
function doSomething() {
    return dispatch => {
        let action = {
            type: MY_ACTION,
            queued: true
        };
        dispatch(action);
        
        setTimeout(() => {
            dispatch({
                type: MY_ACTION_SUCCESS,
                queued: true,
                failed: true
                parent: action
            });
        }, 1000);
    };
}
```

Now the state of entries will revert back to the state just before `MY_ACTION`
