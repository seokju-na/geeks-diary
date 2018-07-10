import { DebugElement } from '@angular/core';


export class DebugElementMatcher {
    not: DebugElementMatcher;

    constructor(public debugElement, private denied = false) {
        if (!this.denied) {
            this.not = new DebugElementMatcher(this.debugElement, true);
        }
    }

    get nativeElem(): HTMLElement {
        return this.debugElement.nativeElement;
    }

    toContainClasses(...classNames: string[]): any {
        let allClassesContained = true;

        for (const className of classNames) {
            if (!this.nativeElem.classList.contains(className)) {
                allClassesContained = false;
            }
        }

        if (this.denied) {
            return expect(allClassesContained).toBeFalsy();
        }

        return expect(allClassesContained).toBeTruthy();
    }

    toContainText(text: string): any {
        return expect(this.nativeElem.innerText).toContain(text);
    }

    toBeDisplayed(): any {
        const displayProp = this.nativeElem.style.display;

        return expect(displayProp).not.toEqual('none');
    }

    toBeDisabled(): any {
        return expect((<any>this.nativeElem).disabled).toBe(true);
    }

    toBeFocused(): boolean {
        return document.activeElement === this.nativeElem;
    }
}


export function expectDebugElement(debugElement: DebugElement): DebugElementMatcher {
    return new DebugElementMatcher(debugElement);
}
