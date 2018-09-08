import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { ButtonComponent } from './button.component';


@Component({
    template: `
        <button gd-button>Button</button>
        <button gd-flat-button>Flat Button</button>
        <button gd-primary-button>Primary Button</button>
        <button id="big-size-button" gd-button [bigSize]="true">
            Big Size Button
        </button>
        <button id="left-icon-contains" gd-button iconContains="left">
            <span>Icon</span>
        </button>
        <button id="right-icon-contains" gd-button iconContains="right">
            <span>Icon</span>
        </button>
    `,
})
class ButtonTestComponent {
}


describe('browser.ui.Button', () => {
    let fixture: ComponentFixture<ButtonTestComponent>;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                declarations: [
                    ButtonComponent,
                    ButtonTestComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonTestComponent);
        fixture.detectChanges();
    });

    describe('button type', () => {
        it('should flat button contains \'Button--type-flat\' class name.', () => {
            const flatButton = fixture.debugElement.query(
                By.css('button[gd-flat-button]'),
            );

            expectDebugElement(flatButton).toContainClasses('Button--type-flat');
        });

        it('should primary button contains \'Button--type-primary\' class name.', () => {
            const primaryButton = fixture.debugElement.query(
                By.css('button[gd-primary-button]'),
            );

            expectDebugElement(primaryButton).toContainClasses('Button--type-primary');
        });
    });

    describe('big size', () => {
        it('should big size button contains \'Button--size-big\' class name.', () => {
            const bigSizeButton = fixture.debugElement.query(
                By.css('button#big-size-button'),
            );

            expectDebugElement(bigSizeButton).toContainClasses('Button--size-big');
        });
    });

    describe('icon contains', () => {
        it('should contains right class name.', () => {
            const leftIconContainsButton = fixture.debugElement.query(
                By.css('button#left-icon-contains'),
            );

            const rightIconContainsButton = fixture.debugElement.query(
                By.css('button#right-icon-contains'),
            );

            expectDebugElement(leftIconContainsButton).toContainClasses('Button--icon-left');
            expectDebugElement(rightIconContainsButton).toContainClasses('Button--icon-right');
        });
    });
});
