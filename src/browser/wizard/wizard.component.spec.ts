import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { fastTestSetup, sample } from '../../../test/helpers';
import { SharedModule, ThemeService, WORKSPACE_DATABASE, WorkspaceDatabase } from '../shared';
import { Themes } from '../ui/style';
import { UiModule } from '../ui/ui.module';
import { WizardComponent } from './wizard.component';


describe('browser.wizard.WizardComponent', () => {
    let fixture: ComponentFixture<WizardComponent>;
    let component: WizardComponent;

    let theme: ThemeService;
    let workspaceDB: WorkspaceDatabase;

    function createFixture(): void {
        fixture = TestBed.createComponent(WizardComponent);
        component = fixture.componentInstance;
    }

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    UiModule,
                    RouterTestingModule,
                ],
                declarations: [
                    WizardComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        theme = TestBed.get(ThemeService);
        workspaceDB = TestBed.get(WORKSPACE_DATABASE);
    });

    it('should set and update theme form workspace database cache if it\'s exists.', () => {
        spyOn(theme, 'applyThemeToHtml');
        spyOn(workspaceDB, 'update');

        const _theme = sample<Themes>(Themes);
        workspaceDB.cachedInfo = { theme: _theme };

        createFixture();

        expect(theme.applyThemeToHtml).toHaveBeenCalledWith(_theme);
        expect(workspaceDB.update).toHaveBeenCalledWith({ theme: _theme });
    });
});
