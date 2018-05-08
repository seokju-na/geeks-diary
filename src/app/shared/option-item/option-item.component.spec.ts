import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyCodes } from '../../../common/key-codes';
import { dispatchKeyboardEvent } from '../../../testing/fake-event';
import { expectDebugElement } from '../../../testing/validation';
import { OptionItemComponent } from './option-item.component';


describe('app.shared.optionItem', () => {
    let fixture: ComponentFixture<OptionItemComponent>;
    let component: OptionItemComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    OptionItemComponent,
                    TestOptionItemComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OptionItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should add class for selection status', () => {
        component.select();
        fixture.detectChanges();

        const optionItem =
            fixture.debugElement.query(By.css('.OptionItem'));

        expectDebugElement(optionItem).toContainsClass('OptionItem--selected');
    });

    it('should add class for activation status', () => {
        component.setActiveStyles();
        fixture.detectChanges();

        const optionItem =
            fixture.debugElement.query(By.css('.OptionItem'));

        expectDebugElement(optionItem).toContainsClass('OptionItem--active');
    });

    it('can select from key board event (enter key)', () => {
        const optionItem =
            fixture.debugElement.query(By.css('.OptionItem'));
        const optionItemComponent = <OptionItemComponent>optionItem.componentInstance;

        expect(optionItemComponent.selected).toBeFalsy();

        dispatchKeyboardEvent(optionItem.nativeElement, 'keydown', KeyCodes.ENTER);
        fixture.detectChanges();

        expect(optionItemComponent.selected).toBeTruthy();
    });

    it('can select from key board event (space key)', () => {
        const optionItem =
            fixture.debugElement.query(By.css('.OptionItem'));
        const optionItemComponent = <OptionItemComponent>optionItem.componentInstance;

        expect(optionItemComponent.selected).toBeFalsy();

        dispatchKeyboardEvent(optionItem.nativeElement, 'keydown', KeyCodes.SPACE);
        fixture.detectChanges();

        expect(optionItemComponent.selected).toBeTruthy();
    });
});


@Component({
    template: `
        <gd-option-item></gd-option-item>
    `,
})
class TestOptionItemComponent {
}
