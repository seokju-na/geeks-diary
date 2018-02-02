import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';


describe('app.shared.IconComponent', () => {
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
        const iconContent = icon.query(By.css('.Icon'));

        expect(icon.componentInstance.size).toEqual('regular');
        expect(iconContent.nativeElement.classList.contains('Icon--size-regular')).toBeTruthy();
    });

    it('should parse class name when icon name has been changed', () => {
        const icon = fixture.debugElement.query(By.directive(IconComponent));
        const iconContent = icon.query(By.css('.Icon'));

        component.iconName = 'SomeIcon';
        fixture.detectChanges();

        expect(iconContent.nativeElement.classList.contains('la-SomeIcon')).toBeTruthy();
    });
});


@Component({
    template: `
        <gd-icon [name]="iconName"></gd-icon>
    `
})
class IconTestAppComponent {
    iconName: string;
}
