import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { fastTestSetup, NoopComponent, NoopModule, sample, sampleWithout } from '../../../../test/helpers';
import { MockDialog } from '../../../../test/mocks/browser';
import { WorkspaceInfo } from '../../../core/workspace';
import { SharedModule, WORKSPACE_DATABASE, WorkspaceDatabase } from '../../shared';
import { ButtonToggleComponent } from '../../ui/button-toggle';
import { Themes, ThemeService } from '../../ui/style';
import { UiModule } from '../../ui/ui.module';
import { WizardChoosingComponent } from './wizard-choosing.component';


describe('browser.wizard.wizardChoosing.WizardChoosingComponent', () => {
    let fixture: ComponentFixture<WizardChoosingComponent>;
    let component: WizardChoosingComponent;

    let mockLocation: SpyLocation;
    let theme: ThemeService;
    let workspaceDB: WorkspaceDatabase;

    const getCloningAnchorEl = (): HTMLAnchorElement =>
        fixture.debugElement.query(By.css('#clone-remote-button')).nativeElement as HTMLAnchorElement;

    const getThemeButtonToggles = (): ButtonToggleComponent[] =>
        fixture.debugElement
            .queryAll(By.directive(ButtonToggleComponent))
            .map(toggle => toggle.componentInstance as ButtonToggleComponent);

    function setCurrentTheme(_theme: Themes): void {
        spyOnProperty(theme, 'currentTheme', 'get').and.returnValue(_theme);
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                    ...MockDialog.imports(),
                    NoopModule,
                    RouterTestingModule.withRoutes([
                        { path: 'cloning', component: NoopComponent },
                    ]),
                ],
                providers: [
                    ...MockDialog.providers(),
                    { provide: Location, useClass: SpyLocation },
                ],
                declarations: [
                    WizardChoosingComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        mockLocation = TestBed.get(Location);
        theme = TestBed.get(ThemeService);
        workspaceDB = TestBed.get(WORKSPACE_DATABASE);

        fixture = TestBed.createComponent(WizardChoosingComponent);
        component = fixture.componentInstance;
    });

    describe('create new workspace', () => {
    });

    describe('clone remote', () => {
        it('should route to \'/cloning\' when click clone remote button.', fakeAsync(() => {
            fixture.detectChanges();

            getCloningAnchorEl().click();
            tick();

            expect(mockLocation.isCurrentPathEqualTo('/cloning')).toBe(true);
        }));
    });

    describe('theme control', () => {
        it('should set theme control value as current theme on \'ngOnInit\'.', () => {
            const _theme = sample<Themes>(Themes);
            setCurrentTheme(_theme);

            fixture.detectChanges();

            expect(component.themeFormControl.value as Themes).toEqual(_theme);
        });

        it('should render theme options as button toggles.', () => {
            fixture.detectChanges();

            const allThemes = Object.values(Themes);

            getThemeButtonToggles().forEach((toggle) => {
                expect(allThemes.includes(toggle.value)).toBe(true);
            });
        });

        it('should not update chosen theme if it equals with previous chosen.', fakeAsync(() => {
            spyOn(workspaceDB, 'update').and.returnValue(Promise.resolve());

            const prevTheme = sample<Themes>(Themes);
            setCurrentTheme(prevTheme);

            fixture.detectChanges();

            const buttonToggle = getThemeButtonToggles().find(toggle => toggle.value === prevTheme);
            buttonToggle._onButtonClick();

            tick(60);

            expect(workspaceDB.update).not.toHaveBeenCalledWith({ theme: prevTheme } as Partial<WorkspaceInfo>);
        }));

        it('should update chosen theme if it\'s not equals with previous chosen.', fakeAsync(() => {
            spyOn(workspaceDB, 'update').and.returnValue(Promise.resolve());

            const prevTheme = sample<Themes>(Themes);
            setCurrentTheme(prevTheme);

            fixture.detectChanges();

            const nextTheme = sampleWithout(Themes, [prevTheme]);
            const buttonToggle = getThemeButtonToggles().find(toggle => toggle.value === nextTheme);
            buttonToggle._onButtonClick();

            tick(60);

            expect(workspaceDB.update).toHaveBeenCalledWith({ theme: nextTheme });
        }));
    });
});
