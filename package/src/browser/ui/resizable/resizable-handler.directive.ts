import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';


@Directive({
    selector: '[gdResizableHandler]',
})
export class ResizableHandlerDirective {
    /** Output current handler `x` position. */
    @Output() readonly resize = new EventEmitter<number>();
    @Output() readonly reset = new EventEmitter<void>();

    @HostBinding('class.ResizableHandler') private className = true;

    private readonly handleDragMove: (event: MouseEvent) => void;
    private readonly handleDragStop: (event: MouseEvent) => void;

    constructor(public _elementRef: ElementRef) {
        this.handleDragMove = (event: MouseEvent): void => {
            this.resize.next(event.clientX);
            event.preventDefault();
        };

        this.handleDragStop = (event: MouseEvent): void => {
            document.removeEventListener('mousemove', this.handleDragMove);
            document.removeEventListener('mouseup', this.handleDragStop);

            event.preventDefault();
        };
    }

    @HostListener('mousedown', ['$event'])
    private dragStart(event: MouseEvent): void {
        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('mouseup', this.handleDragStop);

        event.preventDefault();
    }

    @HostListener('dblclick')
    private _reset(): void {
        this.reset.next();
    }
}
