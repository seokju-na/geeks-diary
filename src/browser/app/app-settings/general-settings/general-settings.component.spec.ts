import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { fastTestSetup } from '../../../../../test/helpers';
import { SharedModule, ThemeService } from '../../../shared';
import { ButtonToggleComponent } from '../../../ui/button-toggle';
import { Themes } from '../../../ui/style';
import { UiModule } from '../../../ui/ui.module';
import { GeneralSettingsComponent } from './general-settings.component';


describe('browser.app.appSettings.GeneralSettingsComponent', () => {
    let fixture: ComponentFixture<GeneralSettingsComponent>;
    let component: GeneralSettingsComponent;

    let theme: ThemeService;

    const getThemeButtonToggles = (): ButtonToggleComponent[] =>
        fixture.debugElement
            .queryAll(By.directive(ButtonToggleComponent))
            .map(toggle => toggle.componentInstance as ButtonToggleComponent);

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    UiModule,
                ],
                declarations: [
                    GeneralSettingsComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        theme = TestBed.get(ThemeService);

        fixture = TestBed.createComponent(GeneralSettingsComponent);
        component = fixture.componentInstance;
    });

    describe('theme', () => {
        it('should set theme form control with current theme.', () => {
            spyOnProperty(theme, 'currentTheme', 'get').and.returnValue(Themes.BASIC_DARK_THEME);
            fixture.detectChanges();

            expect(component.themeFormControl.value).toEqual(Themes.BASIC_DARK_THEME);
        });

        it('should render theme options as button toggles.', () => {
            fixture.detectChanges();

            const allThemes = Object.values(Themes);

            getThemeButtonToggles().forEach((toggle) => {
                expect(allThemes.includes(toggle.value)).toBe(true);
            });
        });

        it('should call set theme update when form control value changes.', () => {
            const setTheme = new Subject<any>();
            const callback = jasmine.createSpy('callback');
            const subscription = setTheme.asObservable().subscribe(callback);

            (theme as any).setTheme = setTheme;

            fixture.detectChanges();

            const buttonToggle = getThemeButtonToggles().find(toggle => toggle.value === Themes.BASIC_LIGHT_THEME);
            buttonToggle._onButtonClick();

            expect(callback).toHaveBeenCalledWith(Themes.BASIC_LIGHT_THEME);
            subscription.unsubscribe();
        });
    });
});
