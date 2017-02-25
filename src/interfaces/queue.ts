import {QueuedAction} from './action';
export interface EntryInQueue<T> {
    action: QueuedAction;
    state: T;
}
