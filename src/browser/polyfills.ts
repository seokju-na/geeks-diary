import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-patch-electron';
// import 'zone.js/dist/zone-node';
// Stupid! We can use zone node patch. I patched every method until I knew this...
// See 'enterZone': 'src/libs/rx.ts'


/**
 * Focus visible polyfill.
 * Source from: https://github.com/WICG/focus-visible
 */
let elementToBePointerFocused = null;
let forceNoFocusVisible = false;
let hadFocusVisibleRecently = false;
let hadFocusVisibleRecentlyTimeout = null;

const inputTypesWhiteList = {
    text: true,
    search: true,
    url: true,
    tel: true,
    email: true,
    password: true,
    number: true,
    date: true,
    month: true,
    week: true,
    time: true,
    datetime: true,
    'datetime-local': true,
};


const focusTriggersKeyboardModality = (el: HTMLElement): boolean => {
    const type = (<HTMLInputElement>el).type;
    const tagName = el.tagName;

    if (tagName === 'INPUT'
        && inputTypesWhiteList[type]
        && !(<HTMLInputElement>el).readOnly) {

        return true;
    }

    if (tagName === 'TEXTAREA' && !(<HTMLTextAreaElement>el).readOnly) {
        return true;
    }

    /* tslint:disable */
    if (el.contentEditable == 'true') {
        return true;
    }
    /* tslint:enable */

    return false;
};


const addFocusVisibleClass = (el: HTMLElement): void => {
    if (el.classList.contains('focus-visible')) {
        return;
    }

    el.classList.add('focus-visible');
    el.setAttribute('data-focus-visible-added', '');
};


const removeFocusVisibleClass = (el: HTMLElement): void => {
    if (!el.classList.contains('focus-visible')) {
        return;
    }

    el.classList.remove('focus-visible');
    el.removeAttribute('data-focus-visible-added');
};


const onKeyDown = (): void => {
    forceNoFocusVisible = false;
};


const onPointerDown = (event: PointerEvent): void => {
    forceNoFocusVisible = false;
    elementToBePointerFocused = event.target;
    // Clicking inside of a <select multiple> element will fire a mousedown
    // on the <option> child, but focus will be set on the <select> itself.
    /* tslint:disable */
    if (elementToBePointerFocused.nodeName == 'OPTION') {
        elementToBePointerFocused = elementToBePointerFocused.parentElement;
    }
    /* tslint:enable */
};


const onFocus = (event: FocusEvent): void => {
    // Prevent IE from focusing the document or HTML element.
    if (event.target === document || (<any>event.target).nodeName === 'HTML') {
        return;
    }

    // Prevent switching to a new tab from looking like a user-initiated focus
    // event.
    if (forceNoFocusVisible) {
        return;
    }

    // If there is no elementToBePointerFocused, then focus is coming from
    // the keyboard. This should always apply `focus-visible`.
    if (!elementToBePointerFocused) {
        addFocusVisibleClass(event.target as HTMLElement);
        return;
    }

    if (elementToBePointerFocused) {
        // - Force focus-visible for elements like <input type="text">, or
        // - Force focus-visible if the clicked on element is calling
        //   focus() on a different element.
        if (focusTriggersKeyboardModality(event.target as HTMLElement)
            || elementToBePointerFocused !== event.target) {

            addFocusVisibleClass(event.target as HTMLElement);
        }

        elementToBePointerFocused = null;
    }
};


const onBlur = (event: Event): void => {
    if (event.target === document || (<any>event.target).nodeName === 'HTML') {
        return;
    }

    if ((<HTMLElement>event.target).classList.contains('focus-visible')) {
        // To detect a tab/window switch, we look for a blur event followed
        // rapidly by a visibility change.
        // If we don't see a visibility change within 100ms, it's probably a
        // regular focus change.
        hadFocusVisibleRecently = true;
        window.clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = window.setTimeout(() => {
            hadFocusVisibleRecently = false;
            window.clearTimeout(hadFocusVisibleRecentlyTimeout);
        }, 100);
        removeFocusVisibleClass(event.target as HTMLElement);
    }
};


const onVisibilityChange = (): void => {
    /* tslint:disable */
    if (document.visibilityState == 'hidden') {
        // !!! Important Note !!!
        // If the tab becomes active again, the browser will handle calling focus
        // on the element. Each browser does this in a different order.
        // https://github.com/WICG/focus-visible/issues/115#issuecomment-363568291
        // Safari will actually call focus on the same element twice.
        // If the tab becomes active again, and the previously focused element
        // did NOT have focus-visible, we need to indicate that.
        if (!hadFocusVisibleRecently) {
            // This flag ensures that when the newly active tab spams the element
            // with focus events, it doesn't look like user-initiated focus.
            // The only way to turn this flag off is for the user to take an action
            // such as pressing a key, or clicking the mouse.
            forceNoFocusVisible = true;
            return;
        }
    }
    /* tslint:enable */
};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focus', onFocus, true);
    document.addEventListener('blur', onBlur, true);
    document.addEventListener('visibilitychange', onVisibilityChange, true);
});
