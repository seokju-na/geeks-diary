import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { expectDom, fastTestSetup, typeInElement } from '../../../../../test/helpers';
import { MockDialog, MockDialogRef } from '../../../../../test/mocks/browser';
import { StackModule, StackViewer } from '../../../stack';
import { DialogRef } from '../../../ui/dialog';
import { UiModule } from '../../../ui/ui.module';
import { NoteCodeSnippetActionDialogData } from './note-code-snippet-action-dialog-data';
import { NoteCodeSnippetActionDialogResult } from './note-code-snippet-action-dialog-result';
import { NoteCodeSnippetActionDialogComponent } from './note-code-snippet-action-dialog.component';


describe('browser.note.noteEditor.NoteCodeSnippetActionDialogComponent', () => {
    let fixture: ComponentFixture<NoteCodeSnippetActionDialogComponent>;
    let component: NoteCodeSnippetActionDialogComponent;

    let mockDialogRef: MockDialogRef<NoteCodeSnippetActionDialogComponent,
        NoteCodeSnippetActionDialogData,
        NoteCodeSnippetActionDialogResult>;
    let stackViewer: StackViewer;

    const getDialogTitleEl = (): HTMLElement =>
        fixture.debugElement.query(By.css('[gdDialogTitle]')).nativeElement as HTMLElement;

    const getLanguageInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(
            By.css('#note-code-snippet-action-language-input'),
        ).nativeElement as HTMLInputElement;

    const getFileNameInputEl = (): HTMLInputElement =>
        fixture.debugElement.query(
            By.css('#note-code-snippet-action-file-name-input'),
        ).nativeElement as HTMLInputElement;

    const getCancelButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(
            By.css('gd-dialog-actions > button:nth-child(1)'),
        ).nativeElement as HTMLButtonElement;

    const getActionButtonEl = (): HTMLButtonElement =>
        fixture.debugElement.query(
            By.css('gd-dialog-actions > button:nth-child(2)'),
        ).nativeElement as HTMLButtonElement;

    function inputDialogDataWithCreateAction(): void {
        component.data = { actionType: 'create' };
        fixture.detectChanges();
    }

    function inputDialogDataWithEditAction(codeLanguageId?: string, codeFileName?: string): void {
        component.data = {
            actionType: 'edit',
            codeLanguageId,
            codeFileName,
        };
        fixture.detectChanges();
    }

    fastTestSetup();

    beforeAll(async () => {
        mockDialogRef = new MockDialogRef(new MockDialog(), NoteCodeSnippetActionDialogComponent);

        await TestBed
            .configureTestingModule({
                imports: [
                    UiModule,
                    StackModule,
                ],
                providers: [
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    NoteCodeSnippetActionDialogComponent,
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        stackViewer = TestBed.get(StackViewer);

        fixture = TestBed.createComponent(NoteCodeSnippetActionDialogComponent);
        component = fixture.componentInstance;
    });

    describe('title', () => {
        it('should display \'Add code snippet\' string as dialog title if action type is create.', () => {
            inputDialogDataWithCreateAction();

            expect(component.dialogTitle).toEqual('Add code snippet');
            expectDom(getDialogTitleEl()).toContainText('Add code snippet');
        });

        it('should display \'Edit code snippet\' string as dialog title if action type is edit.', () => {
            inputDialogDataWithEditAction();

            expect(component.dialogTitle).toEqual('Edit code snippet');
            expectDom(getDialogTitleEl()).toContainText('Edit code snippet');
        });
    });

    describe('form integrations', () => {
        it('should input value filled with input data if code language and file name is provided and '
            + 'action type is \'edit\'.', fakeAsync(() => {
            inputDialogDataWithEditAction('python', 'hello_world.py');

            expect(component.manipulatingFormGroup.value).toEqual({
                language: 'python',
                fileName: 'hello_world.py',
            });
            flush();
            fixture.detectChanges();

            expect(getLanguageInputEl().value).toEqual('python');
            expect(getFileNameInputEl().value).toEqual('hello_world.py');
        }));
    });

    describe('action', () => {
        it('should display \'Create\' as action button string if action type is create.', () => {
            inputDialogDataWithCreateAction();

            expect(component.actionButtonString).toEqual('Create');
            expectDom(getActionButtonEl()).toContainText('Create');
        });

        it('should display \'Save\' as action button string if action type is edit.', () => {
            inputDialogDataWithEditAction();

            expect(component.actionButtonString).toEqual('Save');
            expectDom(getActionButtonEl()).toContainText('Save');
        });

        it('should close dialog with result when click action button.', () => {
            const closeCallback = jasmine.createSpy('close callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

            inputDialogDataWithCreateAction();

            typeInElement('typescript', getLanguageInputEl());
            fixture.detectChanges();

            typeInElement('ho.ts', getFileNameInputEl());
            fixture.detectChanges();

            // Click action button.
            getActionButtonEl().click();

            expect(closeCallback).toHaveBeenCalledWith({
                codeLanguageId: 'typescript',
                codeFileName: 'ho.ts',
            } as NoteCodeSnippetActionDialogResult);
            subscription.unsubscribe();
        });
    });

    describe('close', () => {
        it('should close dialog when click cancel button.', () => {
            const closeCallback = jasmine.createSpy('close callback');
            const subscription = mockDialogRef.afterClosed().subscribe(closeCallback);

            inputDialogDataWithCreateAction();

            // Click cancel button.
            getCancelButtonEl().click();

            expect(closeCallback).toHaveBeenCalledWith(undefined);
            subscription.unsubscribe();
        });
    });
});
