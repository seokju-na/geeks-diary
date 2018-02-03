export function createKeyboardEvent(
    type: string,
    keyCode: number,
    target?: Element,
    key?: string): KeyboardEvent {

    const event = document.createEvent('KeyboardEvent') as any;
    const initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);

    initEventFn(type, true, true, window, 0, 0, 0, 0, 0, keyCode);

    Object.defineProperties(event, {
        keyCode: { get: () => keyCode },
        key: { get: () => key },
        target: { get: () => target }
    });

    return event;
}


export function createFakeEvent(type: string, canBubble = true, cancelable = true) {
    const event = document.createEvent('Event');
    event.initEvent(type, canBubble, cancelable);
    return event;
}
