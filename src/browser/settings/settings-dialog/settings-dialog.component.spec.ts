import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fastTestSetup, NoopComponent } from '../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../test/mocks/browser';
import { DialogRef } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
import { SettingsContext } from '../settings-context';
import { SETTINGS_REGISTRATION, SettingsRegistry } from '../settings-registry';
import { SettingsDialogData } from './settings-dialog-data';
import { SettingsDialogComponent } from './settings-dialog.component';


describe('browser.settings.SettingsDialogComponent', () => {
    let component: SettingsDialogComponent;
    let fixture: ComponentFixture<SettingsDialogComponent>;

    let mockDialogRef: MockDialogRef<SettingsDialogComponent, SettingsDialogData, void>;

    let registry: SettingsRegistry;
    const registration: SettingsContext<any>[] = [
        {
            id: 'settings-1',
            tabName: 'Settings1',
            component: NoopComponent,
        },
        {
            id: 'settings-2',
            tabName: 'Settings2',
            component: NoopComponent,
        },
        {
            id: 'settings-3',
            tabName: 'Settings3',
            component: NoopComponent,
        },
    ];

    @NgModule({
        declarations: [NoopComponent],
        entryComponents: [NoopComponent],
        exports: [NoopComponent],
    })
    class NoopModuleWithEntries {
    }

    fastTestSetup();

    beforeAll(async () => {
        mockDialogRef = new MockDialogRef(new MockDialog(), SettingsDialogComponent);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    NoopModuleWithEntries,
                ],
                providers: [
                    SettingsRegistry,
                    { provide: SETTINGS_REGISTRATION, useValue: registration },
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    SettingsDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        registry = TestBed.get(SettingsRegistry);

        fixture = TestBed.createComponent(SettingsDialogComponent);
        component = fixture.componentInstance;
        component.data = {};
    });

    afterEach(() => {
        registry.ngOnDestroy();
    });

    it('should select first tab by default.', () => {
        fixture.detectChanges();
        expect(component.tabControl.activateTab.value).toEqual('settings-1');
    });

    it('should select initial setting id if it provided.', () => {
        component.data = { initialSettingId: 'settings-3' };
        fixture.detectChanges();

        expect(component.tabControl.activateTab.value).toEqual('settings-3');
    });

    it('should close dialog when click close button.', () => {
        const closeCallback = jasmine.createSpy('close callback');
        const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

        fixture.detectChanges();

        const closeButtonEl = fixture.debugElement.query(
            By.css('button#settings-dialog-close-button'),
        ).nativeElement as HTMLButtonElement;
        closeButtonEl.click();

        expect(closeCallback).toHaveBeenCalled();
        subscription.unsubscribe();
    });
});
