import { dispatchMouseEvent } from './dispatch-event';


export function dragIt(
    dragStep: 'start' | 'move' | 'stop',
    element?: HTMLElement,
    x: number = 0, y: number = 0,
): void {

    switch (dragStep) {
        case 'start':
            dispatchMouseEvent(element, 'mousedown');
            break;

        case 'move':
            dispatchMouseEvent(document, 'mousemove', x, y);
            break;

        case 'stop':
            dispatchMouseEvent(document, 'mouseup');
            break;
    }
}
