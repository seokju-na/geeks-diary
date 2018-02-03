import { DebugElement } from '@angular/core';


class DebugElementMatcher {
    not: DebugElementMatcher;

    constructor(public debugElement, private denied = false) {
        this.not = new DebugElementMatcher(this.debugElement, true);
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
}


export function expectDebugElement(debugElement: DebugElement): DebugElementMatcher {
    return new DebugElementMatcher(debugElement);
}
