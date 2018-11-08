import { ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, expectDom, fastTestSetup } from '../../../../test/helpers';
import { ExpansionModule } from './expansion.module';


describe('browser.ui.expansion', () => {
    let fixture: ComponentFixture<TestExpansionComponent>;
    let component: TestExpansionComponent;

    const getTriggerButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('#trigger')).nativeElement as HTMLButtonElement;

    const getPanelEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('#panel')).nativeElement as HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    CommonModule,
                    ExpansionModule,
                ],
                declarations: [
                    TestExpansionComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestExpansionComponent);
        component = fixture.componentInstance;
    });

    describe('opened -> closed', () => {
        beforeEach(() => {
            component.initialOpened = true;
            fixture.detectChanges();
        });

        it('should close panel when click trigger button.', () => {
            getTriggerButtonEl().click();
            fixture.detectChanges();

            expectDom(getPanelEl()).toBeStyled('display', 'none');
            expectDom(getPanelEl()).toBeStyled('overflow', 'hidden');
        });

        it('should close panel when keydown \'ENTER\'.', () => {
            dispatchKeyboardEvent(getTriggerButtonEl(), 'keydown', ENTER);
            fixture.detectChanges();

            expectDom(getPanelEl()).toBeStyled('display', 'none');
            expectDom(getPanelEl()).toBeStyled('overflow', 'hidden');
        });
    });

    describe('closed -> opened', () => {
        beforeEach(() => {
            component.initialOpened = false;
            fixture.detectChanges();
        });

        it('should open panel when click trigger button.', () => {
            getTriggerButtonEl().click();
            fixture.detectChanges();

            expectDom(getPanelEl()).not.toBeStyled('display', 'none');
            expectDom(getPanelEl()).not.toBeStyled('overflow', 'hidden');
        });

        it('should open panel when keydown \'ENTER\'.', () => {
            dispatchKeyboardEvent(getTriggerButtonEl(), 'keydown', ENTER);
            fixture.detectChanges();

            expectDom(getPanelEl()).not.toBeStyled('display', 'none');
            expectDom(getPanelEl()).not.toBeStyled('overflow', 'hidden');
        });
    });

    it('should trigger button contains triggered class when panel is open.', () => {
        component.initialOpened = true;
        fixture.detectChanges();

        expectDom(getTriggerButtonEl()).toContainClasses('ExpansionTrigger--triggered');
    });
});


@Component({
    template: `
        <button id="trigger" [gdExpansionTrigger]="panel">Toggle</button>
        <div id="panel" gdExpansionPanel #panel="gdExpansionPanel" [expanded]="initialOpened">Panel</div>
    `,
})
class TestExpansionComponent {
    initialOpened: boolean = false;
}
