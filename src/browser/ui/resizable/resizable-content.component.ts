import { Component, ContentChild, ElementRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { updateDomStyles } from '../../utils/dom-style';
import { ResizableHandlerDirective } from './resizable-handler.directive';


@Component({
    selector: 'gd-resizable-content',
    templateUrl: './resizable-content.component.html',
    styleUrls: ['./resizable-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'ResizableContent',
    },
})
export class ResizableContentComponent implements OnInit, OnDestroy {
    @Input() minWidth = -1;
    @Input() maxWidth = Number.MAX_SAFE_INTEGER;

    @ContentChild(ResizableHandlerDirective) handler: ResizableHandlerDirective;

    private initialWidth: number | null = null;
    private resizeSubscription = Subscription.EMPTY;
    private resetSubscription = Subscription.EMPTY;

    constructor(public _elementRef: ElementRef<HTMLElement>) {
    }

    ngOnInit(): void {
        if (!this.handler) {
            throw new Error('Cannot find resizable handler');
        }

        this.initialWidth = this._elementRef.nativeElement.getBoundingClientRect().width;

        this.resizeSubscription = this.handler.resize.subscribe((x) => {
            const hostX = this._elementRef.nativeElement.getBoundingClientRect().left;
            const deltaX = x - hostX;
            let width: number;

            if (this.minWidth <= deltaX && deltaX <= this.maxWidth) {
                width = deltaX;
            } else if (deltaX < this.minWidth) {
                width = this.minWidth;
            } else if (deltaX > this.maxWidth) {
                width = this.maxWidth;
            }

            if (width) {
                updateDomStyles(this._elementRef.nativeElement, { width: `${width}px` });
            }
        });

        this.resetSubscription = this.handler.reset.subscribe(() => {
            updateDomStyles(this._elementRef.nativeElement, { width: `${this.initialWidth}px` });
        });
    }

    ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
        this.resetSubscription.unsubscribe();
    }
}
