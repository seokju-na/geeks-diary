import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input, OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ResizableHandlerDirective } from './resizable-handler.directive';


@Component({
    selector: 'gd-resizable',
    templateUrl: './resizable.component.html',
    styleUrls: ['./resizable.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ResizableComponent implements OnInit, OnDestroy {
    @Input() minWidth = -1;
    @Input() maxWidth = Number.MAX_SAFE_INTEGER;

    @HostBinding('class.Resizable') private className = true;
    @ContentChild(ResizableHandlerDirective) handler: ResizableHandlerDirective;

    private initialWidth: number | null = null;
    private resizeSubscription = Subscription.EMPTY;
    private resetSubscription = Subscription.EMPTY;

    constructor(public _elementRef: ElementRef) {
    }

    ngOnInit(): void {
        if (!this.handler) {
            throw new Error('Cannot find resizable handler');
        }

        this.initialWidth = this.getHostElement().getBoundingClientRect().width;

        this.resizeSubscription = this.handler.resize.subscribe((x) => {
            const hostX = this.getHostElement().getBoundingClientRect().left;
            const deltaX = x - hostX;

            if (this.minWidth <= deltaX && deltaX <= this.maxWidth) {
                this.getHostElement().style.width = `${deltaX}px`;
            } else if (deltaX < this.minWidth) {
                this.getHostElement().style.width = `${this.minWidth}px`;
            } else if (deltaX > this.maxWidth) {
                this.getHostElement().style.width = `${this.maxWidth}px`;
            }
        });

        this.resetSubscription = this.handler.reset.subscribe(() => {
            this.getHostElement().style.width = `${this.initialWidth}px`;
        });
    }

    ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
        this.resetSubscription.unsubscribe();
    }

    private getHostElement(): HTMLElement {
        return this._elementRef.nativeElement;
    }
}
