import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { typeInElement } from '../../../../testing/fake-event';
import { expectDebugElement } from '../../../../testing/validation';
import { MonacoService } from '../../../core/monaco.service';
import { DIALOG_DATA } from '../../../shared/dialog/dialog';
import { DialogRef } from '../../../shared/dialog/dialog-ref';
import { SharedModule } from '../../../shared/shared.module';
import { StackModule } from '../../../stack/stack.module';
import { NoteContentSnippetTypes } from '../../models';
import { NoteEditorSnippetConfig } from '../snippet/snippet';
import { NoteEditorSnippetSettingDialogComponent } from './snippet-setting-dialog.component';


describe('NoteEditorSnippetSettingDialogComponent', () => {
    let fixture: ComponentFixture<NoteEditorSnippetSettingDialogComponent>;

    let data: NoteEditorSnippetConfig;
    let dialogRef: DialogRef<any>;

    beforeEach(() => {
        data = {
            type: NoteContentSnippetTypes.CODE,
            initialValue: '',
            language: 'javascript',
            fileName: 'test-file.js',
            isNewSnippet: false,
        };
    });

    beforeEach(async(() => {
        const mockDialogRef = {
            close: jasmine.createSpy('dialog close'),
        };

        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StackModule,
                ],
                providers: [
                    MonacoService,
                    { provide: DIALOG_DATA, useValue: data },
                    { provide: DialogRef, useValue: mockDialogRef },
                ],
                declarations: [
                    NoteEditorSnippetSettingDialogComponent,
                ],
            })
            .compileComponents();
    }));

    beforeEach(() => {
        dialogRef = TestBed.get(DialogRef);
        fixture = TestBed.createComponent(NoteEditorSnippetSettingDialogComponent);
        fixture.detectChanges();
    });

    it('should output modified settings through dialog reference ' +
        'after submit setting form.', () => {

       const languageInputEl = fixture.debugElement.query(
           By.css('#languageInput')).nativeElement;
       const fileNameInputEl = fixture.debugElement.query(
           By.css('#fileNameInput')).nativeElement;

       typeInElement('some-language', languageInputEl);
       fixture.detectChanges();

       typeInElement('some-filename', fileNameInputEl);
       fixture.detectChanges();

       // Submit settings form
       const submitButton = fixture.debugElement.query(
           By.css('button[aria-label=save-settings-button]'));

       submitButton.nativeElement.click();
       fixture.detectChanges();

       expect(dialogRef.close).toHaveBeenCalledWith({
           language: 'some-language',
           fileName: 'some-filename',
       });
    });

    it('should cancel button be initially focused.', () => {
        const cancelButton = fixture.debugElement.query(
            By.css('button[aria-label=cancel-settings-button]'));

        expectDebugElement(cancelButton).toBeFocused();
    });

    it('should close dialog without any output when click close button.', () => {
        const cancelButton = fixture.debugElement.query(
            By.css('button[aria-label=cancel-settings-button]'));

        cancelButton.nativeElement.click();
        fixture.detectChanges();

        expect(dialogRef.close).toHaveBeenCalledWith();
    });
});
