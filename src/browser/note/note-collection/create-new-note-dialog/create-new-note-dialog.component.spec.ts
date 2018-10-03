import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as path from 'path';
import { expectDom, fastTestSetup, getVisibleErrorAt, typeInElement } from '../../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../../test/mocks/browser';
import { makeNoteContentFileName } from '../../../../core/note';
import { SharedModule, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig } from '../../../shared';
import { DialogRef } from '../../../ui/dialog';
import { UiModule } from '../../../ui/ui.module';
import { NoteError, NoteErrorCodes } from '../../note-errors';
import { NoteCollectionService } from '../note-collection.service';
import { CreateNewNoteDialogComponent } from './create-new-note-dialog.component';


describe('browser.note.noteCollection.CreateNewNoteDialogComponent', () => {
    let fixture: ComponentFixture<CreateNewNoteDialogComponent>;
    let component: CreateNewNoteDialogComponent;

    let collection: NoteCollectionService;
    let mockDialog: MockDialog;
    let mockDialogRef: MockDialogRef<CreateNewNoteDialogComponent>;

    const workspaceConfigs: WorkspaceConfig = {
        rootDirPath: '/test/workspace/',
        geeksDiaryDirPath: '/test/workspace/.geeks-diary/',
        notesDirPath: '/test/workspace/.geeks-diary/notes/',
    };

    const getTitleInputFormFieldDe = (): DebugElement =>
        fixture.debugElement.query(By.css('#note-title-input-form-field'));

    const getTitleInputEl = (): HTMLInputElement =>
        getTitleInputFormFieldDe().query(By.css('input#note-title-input')).nativeElement as HTMLInputElement;

    const getLabelInputFormFieldDe = (): DebugElement =>
        fixture.debugElement.query(By.css('#note-label-input-form-field'));

    const getLabelInputEl = (): HTMLInputElement =>
        getLabelInputFormFieldDe().query(By.css('input#note-label-input')).nativeElement as HTMLInputElement;

    const getFilePathTextareaEl = (): HTMLTextAreaElement =>
        fixture.debugElement.query(By.css('textarea#file-path-textarea')).nativeElement as HTMLTextAreaElement;

    const getCreateNewNoteButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(By.css('button#create-new-note-button')).nativeElement as HTMLButtonElement;

    const getCancelButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(
            By.css('button#create-new-note-cancel-button'),
        ).nativeElement as HTMLButtonElement;

    function submitForm(): void {
        getCreateNewNoteButtonEl().click();
    }

    fastTestSetup();

    beforeAll(async () => {
        collection = jasmine.createSpyObj('collection', [
            'createNewNote',
        ]);

        mockDialog = new MockDialog();
        mockDialogRef = new MockDialogRef<CreateNewNoteDialogComponent>(
            mockDialog,
            CreateNewNoteDialogComponent,
        );

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    SharedModule,
                ],
                providers: [
                    { provide: NoteCollectionService, useValue: collection },
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfigs },
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    CreateNewNoteDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateNewNoteDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should show required error when title input value is empty after input element blur.', () => {
        const titleInputEl = getTitleInputEl();

        typeInElement('', titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        const visibleError = getVisibleErrorAt(getTitleInputFormFieldDe());

        expect(visibleError).not.toBeNull();
        expect(visibleError.errorName).toEqual('required');
    });

    it('should file path textarea to be read only.', () => {
        expectDom(getFilePathTextareaEl()).toHaveAttribute('readonly', '');
    });

    it('should show resolved file path when value of label changes.', () => {
        const title = 'Some Title';
        const label = 'Java Script/Angular';

        const fileName = makeNoteContentFileName(new Date().getTime(), title);
        const filePath = path.resolve(
            workspaceConfigs.rootDirPath,
            label,
            fileName,
        );

        const titleInputEl = getTitleInputEl();

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        typeInElement(label, getLabelInputEl());
        fixture.detectChanges();

        expect(getFilePathTextareaEl().value).toContain(filePath);
    });

    it('should show outside off of file path error when \'OUTSIDE_WORKSPACE\' ' +
        'note error caught after submitted the form.', fakeAsync(() => {
        const title = 'Some Title';
        const label = '../../';

        const titleInputEl = getTitleInputEl();

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        typeInElement(label, getLabelInputEl());
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.reject(new NoteError(NoteErrorCodes.OUTSIDE_WORKSPACE)),
        );

        submitForm();
        flush();
        fixture.detectChanges();

        const visibleError = getVisibleErrorAt(getLabelInputFormFieldDe());

        expect(visibleError).not.toBeNull();
        expect(visibleError.errorName).toEqual('outsideWorkspace');
    }));

    it('should show content file already exists error when ' +
        '\'CONTENT_FILE_EXISTS\' note error caught after submitted the form.', fakeAsync(() => {
        const title = 'Some Title';
        const titleInputEl = getTitleInputEl();

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.reject(new NoteError(NoteErrorCodes.CONTENT_FILE_EXISTS)),
        );

        submitForm();
        flush();
        fixture.detectChanges();

        const visibleError = getVisibleErrorAt(getTitleInputFormFieldDe());

        expect(visibleError).not.toBeNull();
        expect(visibleError.errorName).toEqual('contentFileExists');
    }));

    it('should close dialog when create note success after submitted the form.', fakeAsync(() => {
        const titleInputEl = getTitleInputEl();
        const callback = jasmine.createSpy('dialog close spy');

        const subscription = mockDialogRef.afterClosed().subscribe(callback);

        typeInElement('some title', titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.resolve(),
        );

        submitForm();
        flush();

        expect(callback).toHaveBeenCalled();
        subscription.unsubscribe();
    }));

    it('should close dialog when click close button.', () => {
        const callback = jasmine.createSpy('dialog close spy');
        const subscription = mockDialogRef.afterClosed().subscribe(callback);

        getCancelButtonEl().click();
        fixture.detectChanges();

        expect(callback).toHaveBeenCalled();
        subscription.unsubscribe();
    });
});
