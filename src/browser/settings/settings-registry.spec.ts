import { TestBed } from '@angular/core/testing';
import { fastTestSetup, NoopComponent, NoopModule } from '../../../test/helpers';
import { SettingsContext } from './settings-context';
import { SETTINGS_REGISTRATION, SettingsRegistry } from './settings-registry';


describe('browser.settings.SettingsRegistry', () => {
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

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopModule,
            ],
            providers: [
                { provide: SETTINGS_REGISTRATION, useValue: registration },
                SettingsRegistry,
            ],
        });
    });

    beforeEach(() => {
        registry = TestBed.get(SettingsRegistry);
    });

    afterEach(() => {
        registry.ngOnDestroy();
    });

    describe('getSettings', () => {
        it('should return settings by sorted order.', () => {
            const contexts = registry.getSettings();
            expect(contexts).toEqual(registration);
        });
    });
});
