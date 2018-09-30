import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fastTestSetup } from '../../../../test/helpers';
import { IconModule } from './icon.module';


describe('browser.ui.icon', () => {
    let fixture: ComponentFixture<TestIconComponent>;
    let component: TestIconComponent;

    const getIconEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('gd-icon')).nativeElement as HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [IconModule],
                declarations: [TestIconComponent],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestIconComponent);
        component = fixture.componentInstance;
    });

    it('should contains \'Icon\' class.', () => {
        expect(getIconEl().classList.contains('Icon')).toBe(true);
    });

    it('should role attribute set to be \'img\'.', () => {
        expect(getIconEl().getAttribute('role')).toEqual('img');
    });
});


@Component({
    template: '<gd-icon [name]="name"></gd-icon>',
})
class TestIconComponent {
    name = 'cog';
}

