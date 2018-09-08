import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { throwError } from 'rxjs';
import { fastTestSetup } from '../../../test/helpers/fast-test-setup';
import { MockDialog } from '../../../test/mocks/browser/mock-dialog';
import { ConfirmDialog } from '../core/confirm-dialog/confirm-dialog';
import { CoreModule } from '../core/core.module';
import { Themes, ThemeService } from '../core/theme.service';
import { WORKSPACE_DATABASE, WorkspaceDatabase } from '../core/workspace-database';
import { WorkspaceService } from '../core/workspace.service';
import { ButtonToggleComponent } from '../ui/button-toggle/button-toggle.component';
import { WizardComponent } from './wizard.component';


describe('browser.wizard.WizardComponent', () => {
    let fixture: ComponentFixture<WizardComponent>;
    let component: WizardComponent;

    let workspace: WorkspaceService;
    let workspaceDB: WorkspaceDatabase;
    let theme: ThemeService;
    let confirmDialog: ConfirmDialog;

    fastTestSetup();

    beforeAll(async () => {
        await TestBed
            .configureTestingModule({
                imports: [
                    CoreModule,
                    ...MockDialog.importsForTesting,
                ],
                providers: [
                    ...MockDialog.providersForTesting,
                ],
                declarations: [WizardComponent],
                schemas: [CUSTOM_ELEMENTS_SCHEMA],
            })
            .compileComponents();
    });

    beforeEach(() => {
        workspace = TestBed.get(WorkspaceService);
        workspaceDB = TestBed.get(WORKSPACE_DATABASE);
        theme = TestBed.get(ThemeService);
        confirmDialog = TestBed.get(ConfirmDialog);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const getCloning = (): DebugElement =>
        fixture.debugElement.query(By.css('gd-wizard-cloning'));

    it('should show error dialog when creating new workspace ' +
        'got failed.', fakeAsync(() => {
        spyOn(confirmDialog, 'openAlert');
        spyOn(workspace, 'initWorkspace')
            .and.returnValue(throwError(new Error('Some Error')));

        const createNewRepoButtonEl = fixture.debugElement.query(
            By.css('#create-new-repository-button'));
        createNewRepoButtonEl.nativeElement.click();
        fixture.detectChanges();

        flush();

        expect(confirmDialog.openAlert).toHaveBeenCalledWith({
            title: 'Error',
            content: 'Some Error',
        });
    }));

    it('should change step when click \'remoteClone\' when click ' +
        'clone a repository button.', () => {
        const buttonEl = fixture.debugElement.query(By.css('#clone-remote-button'));
        buttonEl.nativeElement.click();
        fixture.detectChanges();

        expect(component.step).toEqual('cloneRemote');

        const cloning = fixture.debugElement.query(By.css('gd-wizard-cloning'));
        expect(cloning).not.toBeNull();
    });

    it('should set and save theme selection when select theme.', fakeAsync(() => {
        spyOn(workspaceDB, 'update').and.returnValue(Promise.resolve(null));
        spyOn(theme, 'setTheme');

        const themeToggles = fixture.debugElement.queryAll(By.directive(ButtonToggleComponent));
        themeToggles[1].componentInstance._buttonEl.nativeElement.click();
        fixture.detectChanges();

        tick(100);

        expect(workspaceDB.update).toHaveBeenCalledWith({ theme: Themes.BASIC_DARK_THEME });
        expect(theme.setTheme).toHaveBeenCalledWith(Themes.BASIC_DARK_THEME);
    }));

    it('should create new workspace if clone repository completed.', () => {
        component.stepTo('cloneRemote');
        fixture.detectChanges();

        spyOn(component, 'createNewWorkspace');

        getCloning().triggerEventHandler('cloneComplete', {});
        fixture.detectChanges();

        expect(component.createNewWorkspace).toHaveBeenCalled();
    });
});
