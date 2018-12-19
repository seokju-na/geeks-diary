import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup } from '../../../../test/helpers';
import { UiModule } from '../../ui/ui.module';
import { StackDummy } from '../dummies';
import { Stack } from '../stack.model';
import { StackItemComponent } from './stack-item.component';


describe('browser.stack.stackShared.StackItemComponent', () => {
    let fixture: ComponentFixture<StackItemComponent>;
    let component: StackItemComponent;

    const stackDummy = new StackDummy();

    const getIconEl = (): HTMLImageElement =>
        (fixture.debugElement.nativeElement as HTMLElement).querySelector('.StackItem__wrapper > img');

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                ],
                declarations: [
                    StackItemComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StackItemComponent);
        component = fixture.componentInstance;
    });

    describe('no stack input', () => {
        beforeEach(() => {
            component.stack = null;
            fixture.detectChanges();
        });

        it('should icon not exists.', () => {
            expect(fixture.debugElement.query(By.css('.StackItem__wrapper > img'))).toBeNull();
        });

        it('should tooltip are not enabled because tooltip message is empty.', fakeAsync(() => {
            component._tooltip.show();
            fixture.detectChanges();
            tick(500);

            expect(component._tooltip.isTooltipVisible()).toBe(false);
        }));

        it('should detect stack input changes.', () => {
            const stack = stackDummy.create(true, true);

            // Should detect changes.
            component.stack = stack;
            fixture.detectChanges();

            expectDom(getIconEl()).toHaveAttribute('alt', stack.name);
            expectDom(getIconEl()).toHaveAttribute('src', stack.iconFilePath);
        });
    });

    describe('stack with no icon', () => {
        let stack: Stack;

        beforeEach(() => {
            stack = stackDummy.create(false, false);
            component.stack = stack;
            fixture.detectChanges();
        });

        it('should icon not exists.', () => {
            expect(fixture.debugElement.query(By.css('.StackItem__wrapper > img'))).toBeNull();
        });

        it('should now show tooltip when input \'disableTooltip\' to true.', fakeAsync(() => {
            component.disableTooltip = true;
            fixture.detectChanges();

            component._tooltip.show();
            fixture.detectChanges();
            tick(500);

            expect(component._tooltip.isTooltipVisible()).toBe(false);
        }));
    });

    describe('stack with icon', () => {
        let stack: Stack;

        beforeEach(() => {
            stack = stackDummy.create(false, true);
            component.stack = stack;
            fixture.detectChanges();
        });

        it('should icon exists.', () => {
            expectDom(getIconEl()).toHaveAttribute('alt', stack.name);
            expectDom(getIconEl()).toHaveAttribute('src', stack.iconFilePath);
        });
    });
});
