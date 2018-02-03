import { createFakeEvent, createKeyboardEvent } from './event-objects';


export function dispatchEvent(node: Node | Window, event: Event): Event {
    node.dispatchEvent(event);
    return event;
}

export function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event {
    return dispatchEvent(node, createFakeEvent(type, canBubble));
}

export function dispatchKeyboardEvent(
    node: Node,
    type: string,
    keyCode: number,
    target?: Element): KeyboardEvent {

    return dispatchEvent(node, createKeyboardEvent(type, keyCode, target)) as KeyboardEvent;
}
