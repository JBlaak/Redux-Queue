import {Action} from './action';
export type Reducer<T> = (state: T, action: Action) => T;
