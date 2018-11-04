import { END, ENTER, HOME, RIGHT_ARROW, SPACE } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, expectDom, fastTestSetup } from '../../../../test/helpers';
import { TabControl } from './tab-control';
import { TabItemDirective } from './tab-item.directive';
import { TabsModule } from './tabs.module';


describe('browser.ui.tabs.TabGroupComponent', () => {
    let fixture: ComponentFixture<TestTabGroupComponent>;
    let component: TestTabGroupComponent;

    let tabGroupHostEl: HTMLElement;

    const getTabItemElList = (): HTMLElement[] =>
        fixture.debugElement.queryAll(By.directive(TabItemDirective)).map(de => de.nativeElement as HTMLElement);

    const getContentEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('#content')).nativeElement as HTMLElement;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    CommonModule,
                    TabsModule,
                ],
                declarations: [
                    TestTabGroupComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestTabGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        tabGroupHostEl = fixture.debugElement.query(By.css('gd-tab-group')).nativeElement as HTMLElement;
    });

    describe('basic behavior', () => {
        it('should tab items are exists.', () => {
            const tabItemElList = getTabItemElList();
            expect(tabItemElList.length).toEqual(component.control.tabs.length);

            tabItemElList.forEach((tabItemEl, index) => {
                expectDom(tabItemEl).toContainText(component.control.tabs[index].name);
            });
        });

        it('should selected tab is activated.', () => {
            const selectedTabEl = getTabItemElList()[0];

            expectDom(selectedTabEl).toContainClasses('TabItem--activate');
        });

        it('should available to select tab by tab control.', () => {
            component.control.selectTabByIndex(1);
            fixture.detectChanges();

            expectDom(getTabItemElList()[1]).toContainClasses('TabItem--activate');
        });

        it('should tab index is 0 if tab is active, else index should be -1.', () => {
            expect(getTabItemElList()[0].tabIndex).toEqual(0);
            expect(getTabItemElList()[1].tabIndex).toEqual(-1);
            expect(getTabItemElList()[2].tabIndex).toEqual(-1);
        });

        it('should focus next item when \'RIGHT_ARROW\' keydown.', () => {
            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            expect(getTabItemElList()[1]).toEqual(document.activeElement);
        });

        it('should select first item when \'HOME\' keydown.', () => {
            // First, select other tab.
            component.control.selectTabByIndex(2);
            fixture.detectChanges();

            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', HOME);
            fixture.detectChanges();

            expect(component.control.activeTabIndex).toEqual(0);
            expectDom(getTabItemElList()[0]).toContainClasses('TabItem--activate');
        });

        it('should select last item when \'END\' keydown.', () => {
            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', END);
            fixture.detectChanges();

            expect(component.control.activeTabIndex).toEqual(3);
            expectDom(getTabItemElList()[3]).toContainClasses('TabItem--activate');
        });

        it('should select active tab when \'SPACE\' or \'ENTER\' keydown.', () => {
            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', SPACE);
            fixture.detectChanges();

            expect(component.control.activeTabIndex).toEqual(1);
            expectDom(getTabItemElList()[1]).toContainClasses('TabItem--activate');

            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tabGroupHostEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(component.control.activeTabIndex).toEqual(2);
            expectDom(getTabItemElList()[2]).toContainClasses('TabItem--activate');
        });

        it('should select tab when click the tab.', () => {
            getTabItemElList()[2].click();
            fixture.detectChanges();

            expect(component.control.activeTabIndex).toEqual(2);
            expectDom(getTabItemElList()[2]).toContainClasses('TabItem--activate');
        });
    });

    describe('ngSwitch integration', () => {
        it('should show content when select tab changes.', () => {
            expectDom(getContentEl()).toContainText('Avicii');

            getTabItemElList()[1].click();
            fixture.detectChanges();
            expectDom(getContentEl()).toContainText('Kygo');

            getTabItemElList()[2].click();
            fixture.detectChanges();
            expectDom(getContentEl()).toContainText('Alan Walker');

            getTabItemElList()[3].click();
            fixture.detectChanges();
            expectDom(getContentEl()).toContainText('Daft Punk');

            getTabItemElList()[0].click();
            fixture.detectChanges();
            expectDom(getContentEl()).toContainText('Avicii');
        });
    });
});


@Component({
    template: `
        <gd-tab-group [tabControl]="control"></gd-tab-group>
        <div [ngSwitch]="control.activateTab?.value" id="content">
            <div *ngSwitchCase="'avicii'">Avicii</div>
            <div *ngSwitchCase="'kygo'">Kygo</div>
            <div *ngSwitchCase="'alan-walker'">Alan Walker</div>
            <div *ngSwitchCase="'daft-punk'">Daft Punk</div>
        </div>
    `,
})
class TestTabGroupComponent {
    readonly control = new TabControl([
        { name: 'Avicii', value: 'avicii' },
        { name: 'Kygo', value: 'kygo' },
        { name: 'Alan Walker', value: 'alan-walker' },
        { name: 'Daft Punk', value: 'daft-punk' },
    ]);
}
