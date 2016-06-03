/**
 * @flow
 */

type Action = {
  type: String
}

type QueuedAction = {
  type: String,
  queued: Boolean,
  parent: ?QueuedAction,
  failed: ?boolean
}

type Entry = {
  action: QueuedAction,
  state:any
}

type Reducer<U> = (state:U, action:Action) => U;

export default (reducer:Reducer) => {

  const queue:Array<Entry> = [];

  /**
   * Clones an object so it wont be mutated for future use
   * @param obj
   */
  const clone:any = (obj:any) => JSON.parse(JSON.stringify(obj));

  /**
   * Handles adding the action and re-application of previous state
   * @param parentIndex
   * @param action
   * @returns {*}
   */
  const handleParent = (parentIndex:number, action:QueuedAction):any => {
    const parent:?Entry = queue[ parentIndex ];
    if (!parent) {
      throw new Error('Invalid parent index');
    }
    let state = parent.state;

    queue.splice(parentIndex + 1, 0, toEntry(action, state));

    for (let i = parentIndex; i < queue.length; i++) {
      queue[ i ] = toEntry(queue[ i ].action, state);
      state = reducer(state, queue[ i ].action);
    }

    return state;
  };

  /**
   * Handle error, revert back to original state before the error occured
   * @param parentIndex
   * @param action
   * @returns {*}
   */
  const handleError = (parentIndex:number, action:QueuedAction):any => {
    let parent:?Entry = queue[ parentIndex ];
    if (!parent) {
      throw new Error('Invalid parent index');
    }

    queue.splice(parentIndex, queue.length - parentIndex);

    return parent.state;
  };

  /**
   * Handles execution of an action which has a parent
   * @param currentState
   * @param action
   * @returns {*}
   */
  const handleQueuedAction = (currentState:any, action:QueuedAction):any => {
    let parentIndex:number = queue.findIndex(e => e.action == action.parent);
    if (parentIndex == -1) {
      console.warn('Action dispatched with invalid parent', action);
      return currentState;
    }

    if (action.failed) {
      return handleError(parentIndex, action);
    }
    return handleParent(parentIndex, action);
  };

  /**
   * Handles execution of an action
   * @param state
   * @param action
   * @returns {*}
   */
  const handle = (state:any, action:QueuedAction):any => {
    if (action.parent != null) {
      return handleQueuedAction(state, action);
    }
    queue.push(toEntry(action, state));
    return reducer(state, action);
  };

  /**
   * Creates an entry from action and state
   * @param action
   * @param state
   * @returns {{action, state}}
   */
  const toEntry = (action:QueuedAction, state:any):Entry => {
    return {
      action: action,
      state: clone(state)
    };
  };

  return (state:any, action:QueuedAction) => {
    return action && action.queued && action.parent
      ? handle(state, action)
      : reducer(state, action);
  }
};

