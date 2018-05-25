import { DebugElement } from '@angular/core';


class DebugElementMatcher {
    not: DebugElementMatcher;

    constructor(public debugElement, private denied = false) {
        if (!this.denied) {
            this.not = new DebugElementMatcher(this.debugElement, true);
        }
    }

    get nativeElem(): HTMLElement {
        return this.debugElement.nativeElement;
    }

    toContainsClass(className: string): boolean {
        const classContained = this.nativeElem.classList.contains(className);

        if (this.denied) {
            return expect(classContained).toBeFalsy();
        }

        return expect(classContained).toBeTruthy();
    }

    toBeDisplayed(): boolean {
        const displayProp = this.nativeElem.style.display;

        return expect(displayProp).not.toEqual('none');
    }
}


export function expectDebugElement(debugElement: DebugElement): DebugElementMatcher {
    return new DebugElementMatcher(debugElement);
}
