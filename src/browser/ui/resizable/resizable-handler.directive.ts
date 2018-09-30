import { Directive, EventEmitter, HostListener, Output } from '@angular/core';


@Directive({
    selector: '[gdResizableHandler]',
    host: {
        'class': 'ResizableHandler',
    },
})
export class ResizableHandlerDirective {
    /** Emits `x` position of handler. */
    @Output() readonly resize = new EventEmitter<number>();

    /** Emits when content width reseted. */
    @Output() readonly reset = new EventEmitter<void>();

    private readonly handleDragMove: (event: MouseEvent) => void;
    private readonly handleDragStop: (event: MouseEvent) => void;

    constructor() {
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
