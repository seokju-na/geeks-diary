import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup, getVisibleErrorAt, typeInElement } from '../../../../test/helpers';
import { MockDialog, MockDialogRef, MockFsService } from '../../../../test/mocks/browser';
import { DialogRef } from '../../ui/dialog';
import { UiModule } from '../../ui/ui.module';
import { FsService } from '../fs.service';
import { ChangeFileNameDialogData } from './change-file-name-dialog-data';
import { ChangeFileNameDialogResult } from './change-file-name-dialog-result';
import { ChangeFileNameDialogComponent } from './change-file-name-dialog.component';


describe('browser.shared.ChangeFileNameDialog', () => {
    let fixture: ComponentFixture<ChangeFileNameDialogComponent>;
    let component: ChangeFileNameDialogComponent;

    let mockFs: MockFsService;
    let mockDialog: MockDialog;
    let mockDialogRef: MockDialogRef<ChangeFileNameDialogComponent,
        ChangeFileNameDialogData,
        ChangeFileNameDialogResult>;

    const directoryPath = '/test/workspace/';

    const getFileNameInputFormFieldDe = (): DebugElement =>
        fixture.debugElement.query(By.css('#file-name-input-form-field'));
    const getFileNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(By.css('input#file-name-input')).nativeElement as HTMLInputElement;

    const getSubmitButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('.ChangeFileNameDialog__submitButton')).nativeElement as HTMLButtonElement;

    fastTestSetup();

    beforeAll(async () => {
        mockDialog = new MockDialog();
        mockDialogRef = new MockDialogRef<ChangeFileNameDialogComponent,
            ChangeFileNameDialogData,
            ChangeFileNameDialogResult>(
            mockDialog,
            ChangeFileNameDialogComponent,
        );

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    ...MockDialog.imports(),
                ],
                providers: [
                    ...MockDialog.providers(),
                    ...MockFsService.providers(),
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    ChangeFileNameDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        mockFs = TestBed.get(FsService);

        fixture = TestBed.createComponent(ChangeFileNameDialogComponent);
        component = fixture.componentInstance;
        component.data = { directoryPath };
    });

    afterEach(() => {
        mockDialog.closeAll();
        mockFs.verify();
    });

    describe('form input', () => {
        it('should set form value if file name was given from dialog data on component init.', () => {
            component.data.fileName = 'i_want_to_change';
            fixture.detectChanges();

            expect(component.formGroup.get('fileName').value as string).toEqual('i_want_to_change');

            mockFs.discardPeriodStubs();
        });

        it('should show form field error if file name is already exists in given directory path '
            + 'when user blurs file name input.', fakeAsync(() => {
            fixture.detectChanges();

            typeInElement('some-file-name', getFileNameInputEl());
            getFileNameInputEl().blur();
            fixture.detectChanges();

            mockFs
                .expect({
                    methodName: 'readDirectory',
                    args: [directoryPath],
                })
                .flush(['some-file-name']);

            fixture.detectChanges();

            const error = getVisibleErrorAt(getFileNameInputFormFieldDe());

            expect(error).not.toBeNull();
            expect(error.errorName).toEqual('fileAlreadyExists');
        }));

        it('should enable submit button if file is not exists in given directory path when user blurs '
            + 'file name input.', fakeAsync(() => {
            fixture.detectChanges();

            typeInElement('some-file-name', getFileNameInputEl());
            getFileNameInputEl().blur();
            fixture.detectChanges();

            mockFs
                .expect({
                    methodName: 'readDirectory',
                    args: [directoryPath],
                })
                .flush(['some-file-name-ho']);

            fixture.detectChanges();

            expectDom(getSubmitButtonEl()).not.toBeDisabled();
        }));

        it('should change directory value when file name change.', () => {
            component.data.fileName = 'old_file_name';
            fixture.detectChanges();

            expect(component.formGroup.get('directory').value as string).toEqual(
                '/test/workspace/old_file_name',
            );

            component.formGroup.get('fileName').patchValue('new_file_name');

            expect(component.formGroup.get('directory').value as string).toEqual(
                '/test/workspace/new_file_name',
            );

            mockFs.discardPeriodStubs();
        });
    });

    describe('form submit and dialog close', () => {
        const fileName = 'test-file-name.ts';

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();

            typeInElement(fileName, getFileNameInputEl());
            getFileNameInputEl().blur();
            fixture.detectChanges();

            mockFs
                .expect({
                    methodName: 'readDirectory',
                    args: [directoryPath],
                })
                .flush(['not-this-file', 'me_either']);

            fixture.detectChanges();
        }));

        it('should close dialog when click cancel button.', () => {
            const closeDialogCallback = jasmine.createSpy('close dialog callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeDialogCallback);

            const cancelButton = fixture.debugElement.query(
                By.css('.ChangeFileNameDialog__cancelButton'),
            ).nativeElement as HTMLButtonElement;

            cancelButton.click();

            expect(closeDialogCallback).toHaveBeenCalledWith(undefined);
            subscription.unsubscribe();
        });

        it('should close dialog with result when click submit button', () => {
            const closeDialogCallback = jasmine.createSpy('close dialog callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeDialogCallback);

            getSubmitButtonEl().click();

            expect(closeDialogCallback).toHaveBeenCalledWith({
                isChanged: true,
                changedFileName: fileName,
            } as ChangeFileNameDialogResult);
            subscription.unsubscribe();
        });
    });
});
