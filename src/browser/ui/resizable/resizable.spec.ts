import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent, fastTestSetup } from '../../../../test/helpers';
import { dragIt } from '../../../../test/helpers/drag-it';
import { ResizableModule } from './resizable.module';


describe('browser.ui.resizable', () => {
    let fixture: ComponentFixture<TestResizableComponent>;
    let component: TestResizableComponent;

    let contentEl: HTMLElement;
    let handlerEl: HTMLElement;

    const getXToMove = (distance: number): number =>
        contentEl.getBoundingClientRect().left + distance;

    function moveHandlerTo(distance: number): void {
        dragIt('start', handlerEl);
        dragIt('move', null, getXToMove(distance));
        tick();
        dragIt('stop');
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [ResizableModule],
                declarations: [TestResizableComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestResizableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        contentEl = fixture.debugElement.query(By.css('#resizable')).nativeElement as HTMLElement;
        handlerEl = fixture.debugElement.query(By.css('#resizable-handler')).nativeElement as HTMLElement;
    });

    it('should change resizable content when user drags handler.', fakeAsync(() => {
        moveHandlerTo(200);
        expect(contentEl.getBoundingClientRect().width).toEqual(200);
    }));

    it('should change content width to minimum width when user drags handler less than '
        + 'the minimum width.', fakeAsync(() => {
        component.minWidth = 80;
        fixture.detectChanges();

        moveHandlerTo(50);

        expect(contentEl.getBoundingClientRect().width).toEqual(80);
    }));

    it('should change content width to maximum width when user drags handler more than '
        + 'the maximum width.', fakeAsync(() => {
        component.maxWidth = 300;
        fixture.detectChanges();

        moveHandlerTo(400);

        expect(contentEl.getBoundingClientRect().width).toEqual(300);
    }));

    it('should change content width to initial width when user double-clicks handler.', fakeAsync(() => {
        // First, move content.
        moveHandlerTo(200);

        dispatchFakeEvent(handlerEl, 'dblclick');
        fixture.detectChanges();

        expect(contentEl.getBoundingClientRect().width).toEqual(100);
    }));
});


@Component({
    template: `
        <gd-resizable-content id="resizable" [minWidth]="minWidth" [maxWidth]="maxWidth">
            <span>Some Content</span>
            <div id="resizable-handler" gdResizableHandler></div>
        </gd-resizable-content>
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
