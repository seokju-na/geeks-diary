import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { combineReducers, StoreModule } from '@ngrx/store';
import { Subject } from 'rxjs';
import { fastTestSetup } from '../../../../../test/helpers';
import { SettingsDialog } from '../../../settings';
import { MenuEvent, MenuService } from '../../../shared';
import { AppLayoutModule } from '../app-layout.module';
import { appLayoutReducer } from '../app-layout.reducer';
import { AppLayoutSidenavOutlet } from '../app-layout.state';
import { AppLayoutSidenavComponent } from './app-layout-sidenav.component';


@Component({
    template: '<span>Outlet 1</span>',
})
class Outlet1Component {
}


@Component({
    template: '<span>Outlet 2</span>',
})
class Outlet2Component {
}


@NgModule({
    imports: [
        AppLayoutModule,
        NoopAnimationsModule,
        StoreModule.forRoot({
            layout: combineReducers(appLayoutReducer),
        }),
    ],
    declarations: [
        Outlet1Component,
        Outlet2Component,
    ],
    entryComponents: [
        Outlet1Component,
        Outlet2Component,
    ],
    exports: [
        AppLayoutModule,
        Outlet1Component,
        Outlet2Component,
    ],
})
class TestAppLayoutSidenavModule {
}


describe('browser.app.appLayout.AppLayoutSidenavComponent', () => {
    let fixture: ComponentFixture<AppLayoutSidenavComponent>;
    let component: AppLayoutSidenavComponent;

    let settingsDialog: SettingsDialog;
    let menu: MenuService;

    let menuMessages: Subject<MenuEvent>;

    const outlets: AppLayoutSidenavOutlet[] = [
        {
            id: 'outlet-1',
            name: 'Outlet1',
            iconName: 'folder',
            shortcut: 'Ctrl + 1',
            description: 'Outlet1',
            outletComponent: Outlet1Component,
        },
        {
            id: 'outlet-2',
            name: 'Outlet2',
            iconName: 'folder',
            shortcut: 'Ctrl + 2',
            description: 'Outlet2',
            outletComponent: Outlet2Component,
        },
    ];

    fastTestSetup();

    beforeAll(async () => {
        settingsDialog = jasmine.createSpyObj('settingsDialog', [
            'open',
        ]);
        menu = jasmine.createSpyObj('menu', [
            'onMessage',
        ]);

        await TestBed
            .configureTestingModule({
                imports: [TestAppLayoutSidenavModule],
                providers: [
                    { provide: SettingsDialog, useValue: settingsDialog },
                    { provide: MenuService, useValue: menu },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        menuMessages = new Subject();
        (menu.onMessage as jasmine.Spy).and.callFake(() => menuMessages.asObservable());

        fixture = TestBed.createComponent(AppLayoutSidenavComponent);
        component = fixture.componentInstance;
        component.outlets = outlets;
        fixture.detectChanges();
    });

    describe('toggle panel', () => {
    });

    describe('settings', () => {
        it('should open settings dialog when click settings button.', () => {
            const settingsButtonEl = fixture.debugElement.query(
                By.css('.AppLayoutSidenav__settingsButton'),
            ).nativeElement as HTMLButtonElement;

            settingsButtonEl.click();

            expect(settingsDialog.open).toHaveBeenCalled();
        });

        it('should open settings dialog when menu event called.', () => {
            menuMessages.next(MenuEvent.OPEN_SETTINGS);
            expect(settingsDialog.open).toHaveBeenCalled();
        });
    });
});
