import { dispatchFakeEvent } from './dispatch-event';


export function typeInElement(value: string, element: HTMLInputElement) {
    element.focus();
    element.value = value;
    dispatchFakeEvent(element, 'input');
}
