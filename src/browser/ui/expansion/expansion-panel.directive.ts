import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input } from '@angular/core';
import { removeDomStyle, updateDomStyles } from '../../utils/dom-style';


@Directive({
    selector: '[gdExpansionPanel]',
    exportAs: 'gdExpansionPanel',
})
export class ExpansionPanelDirective {
    constructor(public _elementRef: ElementRef<HTMLElement>) {
    }

    private _expanded: boolean = false;

    @Input()
    get expanded(): boolean {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        if (this._expanded) {
            this.expandPanel();
        } else {
            this.collapsePanel();
        }
    }

    private expandPanel(): void {
        removeDomStyle(this._elementRef.nativeElement, 'display');
        removeDomStyle(this._elementRef.nativeElement, 'overflow');
    }

    private collapsePanel(): void {
        updateDomStyles(this._elementRef.nativeElement, {
            display: 'none',
            overflow: 'hidden',
        });
    }
}
