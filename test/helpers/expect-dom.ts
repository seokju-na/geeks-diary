class DomExpectMatcher {
    readonly not: DomExpectMatcher;

    constructor(private element: HTMLElement, private denied: boolean = false) {
        if (!this.denied) {
            this.not = new DomExpectMatcher(element, true);
        }
    }

    toContainClasses(...classNames: string[]): any {
        let allClassesContained = true;

        for (const className of classNames) {
            if (!this.element.classList.contains(className)) {
                allClassesContained = false;
            }
        }

        return expect(allClassesContained).toBe(!this.denied);
    }

    toContainText(text: string): any {
        if (this.denied) {
            return expect(this.element.innerText).not.toContain(text);
        } else {
            return expect(this.element.innerText).toContain(text);
        }
    }

    toBeDisabled(): any {
        return expect((this.element as any).disabled).toBe(!this.denied);
    }

    toHaveAttribute(name: string, value: string): any {
        if (this.denied) {
            return expect(this.element.getAttribute(name)).not.toEqual(value);
        } else {
            return expect(this.element.getAttribute(name)).toEqual(value);
        }
    }

    toBeFocused(): any {
        if (this.denied) {
            return expect(document.activeElement).not.toEqual(this.element);
        } else {
            return expect(document.activeElement).toEqual(this.element);
        }
    }

    toBeStyled(styleName: string, value: string): any {
        if (this.denied) {
            return expect(getComputedStyle(this.element)[styleName]).not.toEqual(value);
        } else {
            return expect(getComputedStyle(this.element)[styleName]).toEqual(value);
        }
    }
}


export function expectDom(element: HTMLElement): DomExpectMatcher {
    return new DomExpectMatcher(element);
}
