import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';


describe('app.shared.icon', () => {
    let fixture: ComponentFixture<IconTestAppComponent>;
    let component: IconTestAppComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [CommonModule],
                declarations: [
                    IconTestAppComponent,
                    IconComponent
                ]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IconTestAppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('default icon size should be \'regular\'', () => {
        const icon = fixture.debugElement.query(By.directive(IconComponent));

        expect(icon.componentInstance.size).toEqual('regular');
        expect(icon.nativeElement.classList.contains('Icon--size-regular')).toBeTruthy();
    });

    it('should parse class name when icon name has been changed', () => {
        const icon = fixture.debugElement.query(By.directive(IconComponent));

        expect(icon.nativeElement.classList.contains('la-someIcon')).toBeTruthy();
    });
});


@Component({
    template: `
        <i gd-icon [name]="iconName"></i>
    `
})
class IconTestAppComponent {
    iconName = 'someIcon';
}
