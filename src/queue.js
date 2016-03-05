export default reducer => {

    let queue = [];

    /**
     * Clones an object so it wont be mutated for future use
     * @param obj
     */
    const clone = obj => JSON.parse(JSON.stringify(obj));

    /**
     * Handles adding the action and re-application of previous state
     * @param parentIndex
     * @param action
     * @returns {*}
     */
    const handleParent = (parentIndex, action) => {
        let state = queue[parentIndex].state;
        queue.splice(parentIndex + 1, 0, toEntry(action, state));

        for (let i = parentIndex; i < queue.length; i++) {
            queue[i] = toEntry(queue[i].action, state);
            state = reducer(state, queue[i].action);
        }

        return state;
    };

    /**
     * Handle error, revert back to original state before the error occured
     * @param parentIndex
     * @param action
     * @returns {*}
     */
    const handleError = (parentIndex, action) => {
        let parent = queue[parentIndex];

        queue.splice(parentIndex, queue.length - parentIndex);

        return parent.state;
    };

    /**
     * Handles execution of an action which has a parent
     * @param currentState
     * @param action
     * @returns {*}
     */
    const handleActionWithParent = (currentState, action) => {
        let parentIndex = queue.findIndex(e => e.action == action.parent);
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
    const handle = (state, action) => {
        if (action.parent) {
            return handleActionWithParent(state, action);
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
    const toEntry = (action, state) => {
        return {
            action: action,
            state: clone(state)
        };
    };


    return (state, action) => action && action.queued ? handle(state, action) : reducer(state, action);
};

