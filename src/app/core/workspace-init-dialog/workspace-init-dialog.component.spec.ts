import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { typeInElement } from '../../../testing/fake-event';
import { MockFsService, MockGitService } from '../../../testing/mock';
import { expectDebugElement } from '../../../testing/validation';
import { DialogRef } from '../../shared/dialog/dialog-ref';
import { FormFieldErrorComponent } from '../../shared/form-field/form-field-error.component';
import { SharedModule } from '../../shared/shared.module';
import { WorkspaceService } from '../workspace.service';
import { WorkspaceInitDialogComponent } from './workspace-init-dialog.component';


describe('WorkspaceInitDialogComponent', () => {
    let component: WorkspaceInitDialogComponent;
    let fixture: ComponentFixture<WorkspaceInitDialogComponent>;

    let workspaceService: WorkspaceService;
    let dialogRef: DialogRef<WorkspaceInitDialogComponent>;

    beforeEach(async(() => {
        const mockDialogRef = {
            close: jasmine.createSpy('dialog close'),
        };

        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    NoopAnimationsModule,
                ],
                providers: [
                    ...MockFsService.providersForTesting,
                    ...MockGitService.providersForTesting,
                    WorkspaceService,
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [WorkspaceInitDialogComponent],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        workspaceService = TestBed.get(WorkspaceService);
        dialogRef = TestBed.get(DialogRef);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkspaceInitDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should submit button be initially focused.', () => {
        const cancelButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        expectDebugElement(cancelButton).toBeFocused();
    });

    it('should close dialog, after creating workspace success ' +
        'when initialize method is \'createNew\'.', fakeAsync(() => {

        const createNewRadio = fixture.debugElement.query(By.css('#createNewRadio'));
        createNewRadio.triggerEventHandler('change', {
            target: createNewRadio.nativeElement,
        });
        fixture.detectChanges();

        spyOn(workspaceService, 'createWorkspaceRepository')
            .and.returnValue(Promise.resolve(null));

        const submitButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        submitButton.nativeElement.click();
        fixture.detectChanges();

        // Flush workspace initializing job queue.
        flush();

        expect(dialogRef.close).toHaveBeenCalled();
    }));

    it('should close dialog, after cloning remote repository success ' +
        'when initialize method is \'cloneRemote\.', fakeAsync(() => {

        const cloneRemoteRadio = fixture.debugElement.query(By.css('#cloneRemoteRadio'));
        cloneRemoteRadio.triggerEventHandler('change', {
            target: cloneRemoteRadio.nativeElement,
        });
        fixture.detectChanges();

        spyOn(workspaceService, 'cloneRemoteRepository')
            .and.returnValue(Promise.resolve(null));

        const submitButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        submitButton.nativeElement.click();
        fixture.detectChanges();

        // Flush workspace initializing job queue.
        flush();

        expect(dialogRef.close).toHaveBeenCalled();
    }));

    it('should display \'required\' error message, when remote url is empty ' +
        'and initialize method is \'cloneRemote\'.', fakeAsync(() => {
        const cloneRemoteRadio = fixture.debugElement.query(By.css('#cloneRemoteRadio'));
        cloneRemoteRadio.triggerEventHandler('change', {
            target: cloneRemoteRadio.nativeElement,
        });
        fixture.detectChanges();

        const remoteUrlInput = fixture.debugElement.query(By.css('#remoteUrlInput'));
        typeInElement('', remoteUrlInput.nativeElement);
        fixture.detectChanges();

        const submitButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        submitButton.nativeElement.click();
        fixture.detectChanges();

        flush();

        const errorMessage = fixture.debugElement
            .queryAll(By.directive(FormFieldErrorComponent))
            .find(c => c.componentInstance.show);

        expect(errorMessage).not.toBeNull();
        expect(errorMessage.componentInstance.errorName).toEqual('required');
    }));

    it('should display \'connectionError\' error message, when cloning remote ' +
        'repository failed with \'CONNECTION_ERROR\' error and initialize method is ' +
        '\'cloneRemote\.', fakeAsync(() => {
        const cloneRemoteRadio = fixture.debugElement.query(By.css('#cloneRemoteRadio'));
        cloneRemoteRadio.triggerEventHandler('change', {
            target: cloneRemoteRadio.nativeElement,
        });
        fixture.detectChanges();

        const remoteUrlInput = fixture.debugElement.query(By.css('#remoteUrlInput'));
        typeInElement('some-remote-url', remoteUrlInput.nativeElement);
        fixture.detectChanges();

        spyOn(workspaceService, 'cloneRemoteRepository')
            .and.returnValue(Promise.reject({ code: 'CONNECTION_ERROR' }));

        const submitButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        submitButton.nativeElement.click();
        fixture.detectChanges();

        flush();

        const errorMessage = fixture.debugElement
            .queryAll(By.directive(FormFieldErrorComponent))
            .find(c => c.componentInstance.show);

        expect(errorMessage).not.toBeNull();
        expect(errorMessage.componentInstance.errorName).toEqual('connectionError');
    }));

    it('should display \'authenticationFail\' error message, when cloning remote ' +
        'repository failed with \'AUTHENTICATION_FAIL\' error and initialize method is ' +
        '\'cloneRemote\.', fakeAsync(() => {
        const cloneRemoteRadio = fixture.debugElement.query(By.css('#cloneRemoteRadio'));
        cloneRemoteRadio.triggerEventHandler('change', {
            target: cloneRemoteRadio.nativeElement,
        });
        fixture.detectChanges();

        const remoteUrlInput = fixture.debugElement.query(By.css('#remoteUrlInput'));
        typeInElement('some-remote-url', remoteUrlInput.nativeElement);
        fixture.detectChanges();

        spyOn(workspaceService, 'cloneRemoteRepository')
            .and.returnValue(Promise.reject({ code: 'AUTHENTICATION_FAIL' }));

        const submitButton = fixture.debugElement.query(
            By.css('button[aria-label=initialize-workspace-button]'));

        submitButton.nativeElement.click();
        fixture.detectChanges();

        flush();

        const errorMessage = fixture.debugElement
            .queryAll(By.directive(FormFieldErrorComponent))
            .find(c => c.componentInstance.show);

        expect(errorMessage).not.toBeNull();
        expect(errorMessage.componentInstance.errorName).toEqual('authenticationFail');
    }));
});
