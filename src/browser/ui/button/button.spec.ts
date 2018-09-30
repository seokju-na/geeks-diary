import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fastTestSetup } from '../../../../test/helpers';
import { ButtonModule } from './button.module';


@Component({
    template: `
        <button id="normal-primary-button"
                gd-button color="primary">
            Primary Button
        </button>
        <button gd-icon-button id="icon-button"></button>
        <button gd-flat-button id="flat-button"></button>
    `,
})
class TestButtonComponent {
}


describe('browser.ui.button', () => {
    let fixture: ComponentFixture<TestButtonComponent>;
    let component: TestButtonComponent;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    ButtonModule,
                ],
                declarations: [
                    TestButtonComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestButtonComponent);
        component = fixture.componentInstance;
    });

    describe('gd-button', () => {
    });

    describe('gd-icon-button', () => {
        let iconButtonEl: HTMLButtonElement;

        beforeEach(() => {
            iconButtonEl = fixture.debugElement.query(
                By.css('button#icon-button'),
            ).nativeElement as HTMLButtonElement;
        });

        it('should host element contain \'Button\' class.', () => {
            expect(iconButtonEl.classList.contains('Button')).toBe(true);
        });

        it('should host element contain \'IconButton\' class.', () => {
            expect(iconButtonEl.classList.contains('IconButton')).toBe(true);
        });
    });

    describe('gd-flat-button', () => {
        let flatButtonEl: HTMLButtonElement;

        beforeEach(() => {
            flatButtonEl = fixture.debugElement.query(
                By.css('button#flat-button'),
            ).nativeElement as HTMLButtonElement;
        });

        it('should host element contain \'Button\' class.', () => {
            expect(flatButtonEl.classList.contains('Button')).toBe(true);
        });

        it('should host element contain \'FlatButton\' class.', () => {
            expect(flatButtonEl.classList.contains('FlatButton')).toBe(true);
        });
    });
});
