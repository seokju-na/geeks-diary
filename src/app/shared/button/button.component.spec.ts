import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ButtonComponent } from './button.component';


describe('app.shared.button', () => {
    let fixture: ComponentFixture<TestButtonComponent>;
    let component: TestButtonComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [CommonModule],
                declarations: [
                    TestButtonComponent,
                    SpinnerComponent,
                    ButtonComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('default button type should be \'normal\'', () => {
        const button = fixture.debugElement.query(By.directive(ButtonComponent));

        expect(button.componentInstance.buttonType).toEqual('normal');
        expect(button.nativeElement.classList.contains('Button--type-normal')).toBeTruthy();
    });

    it('default button size should be \'regular\'', () => {
        const button = fixture.debugElement.query(By.directive(ButtonComponent));

        expect(button.componentInstance.size).toEqual('regular');
        expect(button.nativeElement.classList.contains('Button--size-regular')).toBeTruthy();
    });
});


@Component({
    template: `
        <button gd-button>Normal content</button>
    `,
})
class TestButtonComponent {
}
