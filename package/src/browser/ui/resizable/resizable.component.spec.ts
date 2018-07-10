import { Component } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '../../../../test/helpers/dispatch-event';
import { dragIt } from '../../../../test/helpers/drag-it';
import { ResizableHandlerDirective } from './resizable-handler.directive';
import { ResizableComponent } from './resizable.component';


describe('ResizableComponent', () => {
    let fixture: ComponentFixture<TestResizableComponent>;

    const getHost = (): ResizableComponent =>
        fixture.debugElement.query(By.directive(ResizableComponent)).componentInstance;

    const getHostSize = (): any =>
        getHost()._elementRef.nativeElement.getBoundingClientRect();

    const getTargetX = (targetWidth: number): number => {
        const resizable = getHost();
        const left = getHostSize().left;

        return left + targetWidth;
    };

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ResizableComponent,
                    ResizableHandlerDirective,
                    TestResizableComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestResizableComponent);
        fixture.detectChanges();
    });

    it('should change host element width when user drags handler.', fakeAsync(() => {
        const handlerEl = getHost().handler._elementRef.nativeElement;

        dragIt('start', handlerEl);
        dragIt('move', null, getTargetX(200));
        tick();

        dragIt('stop');

        expect(getHostSize().width).toEqual(200);
    }));

    describe('minWidth', () => {
        it('should change host element width to minimum width ' +
            'when user drags handler less than the minimum width.', fakeAsync(() => {
            fixture.componentInstance.minWidth = 80;
            fixture.detectChanges();

            const handlerEl = getHost().handler._elementRef.nativeElement;

            dragIt('start', handlerEl);
            dragIt('move', null, getTargetX(50));
            tick();

            dragIt('stop');

            expect(getHostSize().width).toEqual(80);
        }));
    });

    describe('maxWidth', () => {
        it('should change host element width to maximum width ' +
            'when user drags handler more than the maximum width.', fakeAsync(() => {
            fixture.componentInstance.maxWidth = 300;
            fixture.detectChanges();

            const handlerEl = getHost().handler._elementRef.nativeElement;

            dragIt('start', handlerEl);
            dragIt('move', null, getTargetX(400));
            tick();

            dragIt('stop');

            expect(getHostSize().width).toEqual(300);
        }));
    });

    describe('reset', () => {
        beforeEach(fakeAsync(() => {
            const handlerEl = getHost().handler._elementRef.nativeElement;

            dragIt('start', handlerEl);
            dragIt('move', null, getTargetX(200));
            tick();

            dragIt('stop');
        }));

        it('should change host element width to initial width ' +
            'when user double-clicks handler.', () => {
            const handlerEl = getHost().handler._elementRef.nativeElement;

            dispatchFakeEvent(handlerEl, 'dblclick');
            fixture.detectChanges();

            expect(getHostSize().width).toEqual(100);
        });
    });
});


@Component({
    template: `
        <gd-resizable id="resizable" [minWidth]="minWidth" [maxWidth]="maxWidth">
            <span>Some content</span>
            <div id="resizable-handler" gdResizableHandler></div>
        </gd-resizable>
    `,
    styles: [`
        #resizable {
            display: block;
            width: 100px;
        }
    `],
})
class TestResizableComponent {
    minWidth = -1;
    maxWidth = Number.MAX_SAFE_INTEGER;
}
