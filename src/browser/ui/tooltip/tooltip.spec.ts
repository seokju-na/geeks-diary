import { FocusMonitor } from '@angular/cdk/a11y';
import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, fastTestSetup, patchElementFocus } from '../../../../test/helpers';
import { TooltipDirective, TooltipPosition } from './tooltip.directive';
import { TooltipModule } from './tooltip.module';


describe('browser.ui.tooltip', () => {
    let fixture: ComponentFixture<TestTooltipComponent>;
    let component: TestTooltipComponent;

    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [TestTooltipModule],
            })
            .compileComponents();
    });

    beforeEach(() => {
        overlayContainer = TestBed.get(OverlayContainer);
        overlayContainerElement = overlayContainer.getContainerElement();
        focusMonitor = TestBed.get(FocusMonitor);

        fixture = TestBed.createComponent(TestTooltipComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should show and hide the tooltip.', fakeAsync(() => {
        component.tooltip.show();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(true);

        fixture.detectChanges();

        // wait till animation has finished
        tick(500);

        expect(overlayContainerElement.textContent).toContain(component.message);

        // After hide called, a timeout delay is created that will to hide the tooltip.
        const tooltipDelay = 1000;
        component.tooltip.hide(tooltipDelay);
        expect(component.tooltip.isTooltipVisible()).toBe(true);

        // After the tooltip delay elapses, expect that the tooltip is not visible.
        tick(tooltipDelay);
        fixture.detectChanges();
        expect(component.tooltip.isTooltipVisible()).toBe(false);

        // On animation complete, should expect that the tooltip has been detached.
        flushMicrotasks();
    }));

    it('should show with delay', fakeAsync(() => {
        const tooltipDelay = 1000;
        component.tooltip.show(tooltipDelay);
        expect(component.tooltip.isTooltipVisible()).toBe(false);

        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toContain('');

        tick(tooltipDelay);
        expect(component.tooltip.isTooltipVisible()).toBe(true);
        expect(overlayContainerElement.textContent).toContain(component.message);
    }));

    it('should not show if disabled', fakeAsync(() => {
        // Test that disabling the tooltip will not set the tooltip visible
        component.tooltip.disabled = true;
        component.tooltip.show();
        fixture.detectChanges();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(false);

        // Test to make sure setting disabled to false will show the tooltip
        // Sanity check to make sure everything was correct before (detectChanges, tick)
        component.tooltip.disabled = false;
        component.tooltip.show();
        fixture.detectChanges();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(true);
    }));

    it('should hide if disabled while visible', fakeAsync(() => {
        // Display the tooltip with a timeout before hiding.
        component.tooltip.hideDelay = 1000;
        component.tooltip.show();
        fixture.detectChanges();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(true);

        // Set tooltip to be disabled and verify that the tooltip hides.
        component.tooltip.disabled = true;
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(false);
    }));

    it('should hide if the message is cleared while the tooltip is open', fakeAsync(() => {
        component.tooltip.show();
        fixture.detectChanges();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(true);

        fixture.componentInstance.message = '';
        fixture.detectChanges();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(false);
    }));

    it('should not show if hide is called before delay finishes', async(() => {
        const tooltipDelay = 1000;

        component.tooltip.show(tooltipDelay);
        expect(component.tooltip.isTooltipVisible()).toBe(false);

        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toContain('');
        component.tooltip.hide();

        fixture.whenStable().then(() => {
            expect(component.tooltip.isTooltipVisible()).toBe(false);
        });
    }));

    it('should not show tooltip if message is not present or empty', () => {
        component.tooltip.message = undefined!;
        fixture.detectChanges();
        component.tooltip.show();

        component.tooltip.message = null!;
        fixture.detectChanges();
        component.tooltip.show();

        component.tooltip.message = '';
        fixture.detectChanges();
        component.tooltip.show();

        component.tooltip.message = '   ';
        fixture.detectChanges();
        component.tooltip.show();
    });

    it('should be able to modify the tooltip message', fakeAsync(() => {
        component.tooltip.show();
        tick(500);
        expect(component.tooltip._tooltipInstance._visibility).toBe('visible');

        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toContain(component.message);

        const newMessage = 'new tooltip message';
        component.tooltip.message = newMessage;

        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toContain(newMessage);
    }));

    it('should be removed after parent destroyed', fakeAsync(() => {
        component.tooltip.show();
        tick(500);
        expect(component.tooltip.isTooltipVisible()).toBe(true);

        fixture.destroy();
        expect(overlayContainerElement.childNodes.length).toBe(0);
        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should hide when clicking away', fakeAsync(() => {
        component.tooltip.show();
        tick(500);
        fixture.detectChanges();
        tick(500);

        expect(component.tooltip.isTooltipVisible()).toBe(true);
        expect(overlayContainerElement.textContent).toContain(component.message);

        document.body.click();
        tick(500);
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(component.tooltip.isTooltipVisible()).toBe(false);
        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should not hide immediately if a click fires while animating', fakeAsync(() => {
        component.tooltip.show();
        tick(0);
        fixture.detectChanges();

        document.body.click();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toContain(component.message);
    }));

    it('should not throw when pressing ESCAPE', fakeAsync(() => {
        expect(() => {
            dispatchKeyboardEvent(component.button.nativeElement, 'keydown', ESCAPE);
            fixture.detectChanges();
        }).not.toThrow();

        // Flush due to the additional tick that is necessary for the FocusMonitor.
        flush();
    }));

    it('should not show the tooltip on progammatic focus', fakeAsync(() => {
        patchElementFocus(component.button.nativeElement);

        focusMonitor.focusVia(component.button.nativeElement, 'program');
        tick(500);
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.Tooltip')).toBeNull();
    }));

    it('should not show the tooltip on mouse focus', fakeAsync(() => {
        patchElementFocus(component.button.nativeElement);

        focusMonitor.focusVia(component.button.nativeElement, 'mouse');
        tick(500);
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.Tooltip')).toBeNull();
    }));

    it('should set a fallback origin position by inverting the main origin position', () => {
        component.tooltip.position = 'left';
        expect(component.tooltip._getOrigin().main.originX).toBe('start');
        expect(component.tooltip._getOrigin().fallback.originX).toBe('end');

        component.tooltip.position = 'right';
        expect(component.tooltip._getOrigin().main.originX).toBe('end');
        expect(component.tooltip._getOrigin().fallback.originX).toBe('start');

        component.tooltip.position = 'above';
        expect(component.tooltip._getOrigin().main.originY).toBe('top');
        expect(component.tooltip._getOrigin().fallback.originY).toBe('bottom');

        component.tooltip.position = 'below';
        expect(component.tooltip._getOrigin().main.originY).toBe('bottom');
        expect(component.tooltip._getOrigin().fallback.originY).toBe('top');
    });

    it('should set a fallback overlay position by inverting the main overlay position', () => {
        component.tooltip.position = 'left';
        expect(component.tooltip._getOverlayPosition().main.overlayX).toBe('end');
        expect(component.tooltip._getOverlayPosition().fallback.overlayX).toBe('start');

        component.tooltip.position = 'right';
        expect(component.tooltip._getOverlayPosition().main.overlayX).toBe('start');
        expect(component.tooltip._getOverlayPosition().fallback.overlayX).toBe('end');

        component.tooltip.position = 'above';
        expect(component.tooltip._getOverlayPosition().main.overlayY).toBe('bottom');
        expect(component.tooltip._getOverlayPosition().fallback.overlayY).toBe('top');

        component.tooltip.position = 'below';
        expect(component.tooltip._getOverlayPosition().main.overlayY).toBe('top');
        expect(component.tooltip._getOverlayPosition().fallback.overlayY).toBe('bottom');
    });
});


@Component({
    template: `
        <button #button [gdTooltip]="message" [gdTooltipPosition]="position">
            Button
        </button>
    `,
})
class TestTooltipComponent {
    position: TooltipPosition = 'below';
    message = 'initial message';

    @ViewChild(TooltipDirective) tooltip: TooltipDirective;
    @ViewChild('button') button: ElementRef<HTMLButtonElement>;
}


@NgModule({
    imports: [
        TooltipModule,
        NoopAnimationsModule,
    ],
    declarations: [
        TestTooltipComponent,
    ],
    exports: [
        TestTooltipComponent,
    ],
})
class TestTooltipModule {
}
