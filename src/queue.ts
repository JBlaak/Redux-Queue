import {EntryInQueue} from './interfaces/queue';
import {QueuedAction} from './interfaces/action';
export default class Queue<State> {

    private _stack: Array<EntryInQueue<State>> = [];

    public get(index: number): EntryInQueue<State> {
        if (typeof this._stack[index] === 'undefined') {
            throw new Error('Requested non-existent item from queue');
        }

        return this._stack[index];
    }

    public findIndex(comparitor: (entry: EntryInQueue<State>) => boolean): number {
        let parentIndex = -1;
        for (let i = 0; i < this._stack.length && parentIndex === -1; i++) {
            if (comparitor(this._stack[i])) {
                parentIndex = i;
            }
        }

        return parentIndex;
    }

    public size(): number {
        return this._stack.length;
    }

    public setStateForIndex(index: number, state: State) {
        this._stack[index] = this.toEntry(this._stack[index].action, state);
    }

    public truncateAfterIndex(index: number) {
        this._stack.splice(index, this._stack.length - index);
    };

    public push(state: State, action: QueuedAction) {
        this._stack.push(this.toEntry(action, state));
    };

    public injectAfter(parentIndex: number, action: QueuedAction, state: State) {
        this._stack.splice(parentIndex + 1, 0, this.toEntry(action, state));
    };

    private toEntry(action: QueuedAction, state: State): EntryInQueue<State> {
        return {
            action: action,
            state: this.clone<State>(state)
        };
    };

    private clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

}
