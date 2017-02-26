import {Action, ChildAction, QueuedAction} from './interfaces/action';
import {Reducer} from './interfaces/types';
import Queue from './queue';

export default function<State>(reducer: Reducer<State>): Reducer<State> {

    const queue = new Queue<State>();

    const handleQueuedAction = (state: State, action: QueuedAction): State => {
        if ('parent' in action) {
            return handleChildAction(state, <ChildAction> action);
        }

        queue.push(state, action);

        return reducer(state, action);
    };

    const handleChildAction = (currentState: State, childAction: ChildAction): State => {
        const parentIndex = findIndexOfActionInQueue(childAction);
        if (parentIndex === -1) {
            console.warn('Action dispatched with invalid parent', childAction);
            return currentState;
        }

        if (childAction.failed) {
            return handleErroredChildAction(parentIndex);
        }

        return applyChildActionOnState(parentIndex, childAction);
    };

    const applyChildActionOnState = (parentIndex: number, action: QueuedAction) => {
        const state = queue.get(parentIndex).state;

        queue.injectAfter(parentIndex, action, state);

        return replayQueueFromIndex(parentIndex, state);
    };

    const handleErroredChildAction = (parentIndex: number) => {
        const parent = queue.get(parentIndex);

        queue.truncateAfterIndex(parentIndex);

        return parent.state;
    };

    const replayQueueFromIndex = (parentIndex: number, state: State): State => {
        for (let i = parentIndex; i < queue.size(); i++) {
            queue.setStateForIndex(i, state);
            state = reducer(state, queue.get(i).action);
        }
        return state;
    };

    const findIndexOfActionInQueue = function (action: ChildAction): number {
        return queue.findIndex(entry => entry.action === action.parent);
    };

    return function (state: State, action: Action): State {
        if (action && 'queued' in action) {
            return handleQueuedAction(state, <QueuedAction> action);
        }
        return reducer(state, action);
    };
};
