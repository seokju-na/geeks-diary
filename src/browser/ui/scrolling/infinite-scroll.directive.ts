import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { filter, map, pairwise } from 'rxjs/operators';


interface ScrollPosition {
    scrollHeight: number;
    scrollTop: number;
    clientHeight: number;
}


@Directive({
    selector: '[gdInfiniteScroll]',
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
    @Input() threshold = 50;
    @Output() readonly scrolled = new EventEmitter();

    private scrolledDown: Observable<[ScrollPosition, ScrollPosition]>;
    private infiniteScrollSubscription = Subscription.EMPTY;

    constructor(private elementRef: ElementRef<HTMLElement>) {
    }

    ngAfterViewInit(): void {
        this.scrolledDown = fromEvent(this.elementRef.nativeElement, 'scroll').pipe(
            map((event: Event): ScrollPosition => {
                const target = <HTMLElement>event.target;

                const scrollHeight = target.scrollHeight;
                const scrollTop = target.scrollTop;
                const clientHeight = target.clientHeight;

                return { scrollHeight, scrollTop, clientHeight };
            }),
            pairwise(),
            filter(positions => this.isScrollingDown(positions) && this.isScrollExpected(positions[1])),
        );

        this.infiniteScrollSubscription = this.scrolledDown.subscribe(() => {
            this.scrolled.emit();
        });
    }

    ngOnDestroy(): void {
        this.infiniteScrollSubscription.unsubscribe();
    }

    private isScrollingDown(positions: ScrollPosition[]): boolean {
        return positions[0].scrollTop < positions[1].scrollTop;
    }

    private isScrollExpected(position: ScrollPosition): boolean {
        return (position.scrollHeight - (position.scrollTop + position.clientHeight)) < this.threshold;
    }
}
