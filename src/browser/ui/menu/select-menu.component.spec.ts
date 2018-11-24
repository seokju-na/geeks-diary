import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expectDom, fastTestSetup } from '../../../../test/helpers';
import { FormFieldModule } from '../form-field';
import { MenuItem } from './menu-item';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuModule } from './menu.module';


describe('browser.ui.menu.SelectMenuComponent', () => {
    let fixture: ComponentFixture<TestSelectMenuComponent>;
    let component: TestSelectMenuComponent;

    let overlayContainer: OverlayContainer;
    let overlayContainerEl: HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    ReactiveFormsModule,
                    FormFieldModule,
                    MenuModule,
                    NoopAnimationsModule,
                    ReactiveFormsModule,
                ],
                declarations: [
                    TestSelectMenuComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        overlayContainer = TestBed.get(OverlayContainer);
        overlayContainerEl = overlayContainer.getContainerElement();

        fixture = TestBed.createComponent(TestSelectMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        const currentOverlayContainer = TestBed.get(OverlayContainer);

        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    });

    it('should set content as menu item which from form control value.', fakeAsync(() => {
        component.trigger.openMenu();
        tick();
        fixture.detectChanges();

        const menuItems = overlayContainerEl.querySelectorAll('[gd-menu-item]');
        (menuItems[1] as HTMLButtonElement).click();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expectDom(
            fixture.debugElement.query(By.css('gd-select-menu')).nativeElement as HTMLElement,
        ).toContainText(component.menuItems[1].label);
    }));
});


@Component({
    template: `
        <gd-form-field>
            <gd-select-menu
                [formControl]="control"
                [gdMenuTrigger]="menu"
                placeholder="Placeholder"></gd-select-menu>

            <gd-menu #menu="gdMenu">
                <button *ngFor="let item of menuItems"
                        (click)="selectMenu(item)"
                        gd-menu-item>
                    {{ item.label }}
                </button>
            </gd-menu>
        </gd-form-field>
    `,
})
class TestSelectMenuComponent {
    @ViewChild(MenuTriggerDirective) trigger: MenuTriggerDirective;

    control = new FormControl(null, [Validators.required]);
    menuItems: MenuItem[] = [
        { id: 'item-1', label: 'item1' },
        { id: 'item-2', label: 'item2' },
        { id: 'item-3', label: 'item3' },
    ];

    selectMenu(item: MenuItem): void {
        this.control.patchValue(item);
    }
}
