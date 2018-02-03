import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';


describe('app.shared.button', () => {
    let fixture: ComponentFixture<ButtonComponent>;
    let component: ButtonComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [CommonModule],
                declarations: [ButtonComponent]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        component.ngOnChanges();
        fixture.detectChanges();
    });

    it('default button type should be \'normal\'', () => {
        const button = fixture.debugElement.query(By.css('.Button'));

        expect(component.type).toEqual('normal');
        expect(button.nativeElement.classList.contains('Button--type-normal')).toBeTruthy();
    });

    it('default button size should be \'regular\'', () => {
        const button = fixture.debugElement.query(By.css('.Button'));

        expect(component.size).toEqual('regular');
        expect(button.nativeElement.classList.contains('Button--size-regular')).toBeTruthy();
    });
});
