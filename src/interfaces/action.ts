export interface Action {
    type: string;
}

export interface QueuedAction extends Action {
    queued: true;
    failed: boolean;
}

export interface ChildAction extends QueuedAction {
    parent: QueuedAction;
}
