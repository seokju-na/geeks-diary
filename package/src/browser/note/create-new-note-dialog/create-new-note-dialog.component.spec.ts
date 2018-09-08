import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as path from 'path';
import { expectDebugElement } from '../../../../test/helpers/expect-debug-element';
import { fastTestSetup } from '../../../../test/helpers/fast-test-setup';
import { typeInElement } from '../../../../test/helpers/type-in-element';
import { MockDialogRef } from '../../../../test/mocks/browser/mock-dialog-ref';
import { makeContentFileName } from '../../../models/note';
import { WORKSPACE_CONFIGS, WorkspaceConfigs, WorkspaceService } from '../../core/workspace.service';
import { DialogRef } from '../../ui/dialog/dialog-ref';
import { ErrorComponent } from '../../ui/error/error.component';
import { FormFieldComponent } from '../../ui/form-field/form-field.component';
import { UIModule } from '../../ui/ui.module';
import { NoteCollectionService } from '../shared/note-collection.service';
import { NoteError, NoteErrorCodes } from '../shared/note-errors';
import { CreateNewNoteDialogComponent } from './create-new-note-dialog.component';


describe('browser.note.CreateNewNoteDialogComponent', () => {
    let component: CreateNewNoteDialogComponent;
    let fixture: ComponentFixture<CreateNewNoteDialogComponent>;

    let collection: NoteCollectionService;
    let mockDialogRef: MockDialogRef;

    const workspaceConfigs: WorkspaceConfigs = {
        rootDirPath: '/test/workspace/',
        geeksDiaryDirPath: '/test/workspace/.geeks-diary/',
        notesDirPath: '/test/workspace/.geeks-diary/notes/',
    };

    fastTestSetup();

    beforeAll(async() => {
        collection = jasmine.createSpyObj('collection', [
            'createNewNote',
        ]);
        mockDialogRef = new MockDialogRef();

        await TestBed
            .configureTestingModule({
                imports: [
                    UIModule,
                ],
                providers: [
                    { provide: NoteCollectionService, useValue: collection },
                    { provide: WORKSPACE_CONFIGS, useValue: workspaceConfigs },
                    { provide: DialogRef, useValue: mockDialogRef },
                    WorkspaceService,
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

    const getForm = (): DebugElement =>
        fixture.debugElement.query(By.css('form.CreateNewNoteDialog__form'));

    const getFormFields = (): DebugElement[] =>
        getForm().queryAll(By.directive(FormFieldComponent));

    const getTitleInput = (): DebugElement =>
        getForm().query(By.css('input#note-title-input'));

    const getLabelInput = (): DebugElement =>
        getForm().query(By.css('input#note-label-input'));

    const getFilePathTextarea = (): DebugElement =>
        getForm().query(By.css('textarea#file-path'));

    const getCreateNewNoteButton = (): DebugElement =>
        getForm().query(By.css('button#create-new-note-button'));

    const getCancelButton = (): DebugElement =>
        getForm().query(By.css('button#create-new-note-cancel-button'));


    it('should show required error when title input value is empty ' +
        'after input element blur.', () => {
        const inputEl = getTitleInput().nativeElement as HTMLInputElement;

        typeInElement('', inputEl);
        inputEl.blur();
        fixture.detectChanges();

        const visibleError = getFormFields()[0]
            .queryAll(By.directive(ErrorComponent))
            .find(error => (<ErrorComponent>error.componentInstance).show);

        expect(visibleError).toBeDefined();
        expect((<ErrorComponent>visibleError.componentInstance).errorName)
            .toEqual('required');
    });

    it('should file path textarea to be read only.', () => {
        expectDebugElement(getFilePathTextarea()).toHaveAttribute('readonly', '');
    });

    it('should show resolved file path when value of label changes.', () => {
        const title = 'Some Title';
        const label = 'Java Script/Angular';

        const fileName = makeContentFileName(new Date().getTime(), title);
        const filePath = path.resolve(
            workspaceConfigs.rootDirPath,
            label,
            fileName,
        );

        const titleInputEl = getTitleInput().nativeElement as HTMLInputElement;

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        typeInElement(label, getLabelInput().nativeElement);
        fixture.detectChanges();

        const textarea = getFilePathTextarea().nativeElement as HTMLTextAreaElement;
        expect(textarea.value).toContain(filePath);
    });

    it('should show outside off of file path error when \'OUTSIDE_WORKSPACE\' ' +
        'note error caught after submitted the form.', fakeAsync(() => {
        const title = 'Some Title';
        const label = '../../';

        const titleInputEl = getTitleInput().nativeElement as HTMLInputElement;

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        typeInElement(label, getLabelInput().nativeElement);
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.reject(new NoteError(NoteErrorCodes.OUTSIDE_WORKSPACE)),
        );

        const buttonEl = getCreateNewNoteButton().nativeElement as HTMLButtonElement;
        buttonEl.click();
        fixture.detectChanges();

        flush();

        const visibleError = getFormFields()[1]
            .queryAll(By.directive(ErrorComponent))
            .find(error => (<ErrorComponent>error.componentInstance).show);

        expect(visibleError).toBeDefined();
        expect((<ErrorComponent>visibleError.componentInstance).errorName)
            .toEqual('outsideWorkspace');
    }));

    it('should show content file already exists error when ' +
        '\'CONTENT_FILE_EXISTS\' note error caught after submitted the form.', fakeAsync(() => {
        const title = 'Some Title';

        const titleInputEl = getTitleInput().nativeElement as HTMLInputElement;

        typeInElement(title, titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.reject(new NoteError(NoteErrorCodes.CONTENT_FILE_EXISTS)),
        );

        const buttonEl = getCreateNewNoteButton().nativeElement as HTMLButtonElement;
        buttonEl.click();
        fixture.detectChanges();

        flush();

        const visibleError = getFormFields()[0]
            .queryAll(By.directive(ErrorComponent))
            .find(error => (<ErrorComponent>error.componentInstance).show);

        expect(visibleError).toBeDefined();
        expect((<ErrorComponent>visibleError.componentInstance).errorName)
            .toEqual('contentFileExists');
    }));

    it('should close dialog when create note success after ' +
        'submitted the form.', fakeAsync(() => {
        const titleInputEl = getTitleInput().nativeElement as HTMLInputElement;
        const callback = jasmine.createSpy('dialog close spy');

        mockDialogRef.afterClosed().subscribe(callback);

        typeInElement('some title', titleInputEl);
        titleInputEl.blur();
        fixture.detectChanges();

        (<jasmine.Spy>collection.createNewNote).and.returnValue(
            Promise.resolve(),
        );

        const buttonEl = getCreateNewNoteButton().nativeElement as HTMLButtonElement;
        buttonEl.click();
        fixture.detectChanges();

        flush();

        expect(callback).toHaveBeenCalled();
    }));

    it('should close dialog when click close button.', () => {
        const callback = jasmine.createSpy('dialog close spy');
        mockDialogRef.afterClosed().subscribe(callback);

        const buttonEl = getCancelButton().nativeElement as HTMLButtonElement;
        buttonEl.click();
        fixture.detectChanges();

        expect(callback).toHaveBeenCalled();
    });
});
