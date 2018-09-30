import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fastTestSetup } from '../../../../test/helpers';
import { SpinnerModule } from './spinner.module';


describe('browser.ui.spinner', () => {
    let fixture: ComponentFixture<TestSpinnerComponent>;
    let component: TestSpinnerComponent;

    const getSpinnerEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('gd-spinner')).nativeElement as HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [SpinnerModule],
                declarations: [TestSpinnerComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestSpinnerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should contain \'Spinner\' class.', () => {
        expect(getSpinnerEl().classList.contains('Spinner')).toBe(true);
    });

    it('should contain \'Spinner--contrast\' if contrast true.', () => {
        component.isContrast = true;
        fixture.detectChanges();

        expect(getSpinnerEl().classList.contains('Spinner--contrast')).toBe(true);
    });
});


@Component({
    template: `
        <gd-spinner [contrast]="isContrast"></gd-spinner>
    `,
})
class TestSpinnerComponent {
    isContrast = false;
}
