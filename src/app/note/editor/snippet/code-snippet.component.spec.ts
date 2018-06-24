import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { KeyCodes } from '../../../../common/key-codes';
import { dispatchKeyboardEvent } from '../../../../testing/fake-event';
import { MockDialog } from '../../../../testing/mock';
import { MonacoService } from '../../../core/monaco.service';
import { Dialog } from '../../../shared/dialog/dialog';
import { StackModule } from '../../../stack/stack.module';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
    UpdateSnippetContentAction,
} from '../../actions';
import { NoteContentSnippetTypes } from '../../models';
import { noteReducerMap, NoteStateWithRoot } from '../../reducers';
import { NoteEditorSnippetSettingDialogComponent } from '../snippet-setting-dialog/snippet-setting-dialog.component';
import { NoteEditorCodeSnippetComponent } from './code-snippet.component';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippetConfig,
    NoteEditorSnippetRef,
} from './snippet';


describe('app.note.editor.snippet.EditorCodeSnippetComponent', () => {
    let fixture: ComponentFixture<NoteEditorCodeSnippetComponent>;
    let component: NoteEditorCodeSnippetComponent;

    let ref: NoteEditorSnippetRef;
    let config: NoteEditorSnippetConfig;

    let store: Store<NoteStateWithRoot>;
    let mockDialog: MockDialog;

    const getInputField = (): HTMLTextAreaElement =>
        document.querySelector('.monaco-editor .inputarea') as HTMLTextAreaElement;

    const overwriteConfig = (newConfig: Partial<NoteEditorSnippetConfig>) => {
        const overwrittenConfig = { ...config, ...newConfig };

        TestBed.overrideProvider(NOTE_EDITOR_SNIPPET_CONFIG, {
            useValue: overwrittenConfig,
        });
    };

    const configureTestBed = () => TestBed
        .configureTestingModule({
            imports: [
                ...MockDialog.importsForTesting,
                StackModule,
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                ...MockDialog.providersForTesting,
                MonacoService,
                { provide: NOTE_EDITOR_SNIPPET_REF, useValue: ref },
                { provide: NOTE_EDITOR_SNIPPET_CONFIG, useValue: config },
            ],
            declarations: [
                NoteEditorCodeSnippetComponent,
            ],
        })
        .compileComponents();

    const createFixture = () => {
        fixture = TestBed.createComponent(NoteEditorCodeSnippetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(() => {
        ref = new NoteEditorSnippetRef('noteId');
        config = {
            type: NoteContentSnippetTypes.CODE,
            initialValue: 'initial value',
            language: 'javascript',
            fileName: 'some-file',
            isNewSnippet: false,
        };
    });

    afterEach(() => {
        if (fixture) {
            fixture.debugElement.nativeElement.remove();
        }
    });

    describe('initialize', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();
        });

        it('should show initial value when initialized editor.', () => {
            expect(component.getValue()).toEqual(config.initialValue);
        });

        it('should language has been set.', () => {
            expect(component.getLanguage()).toEqual(config.language);
        });
    });

    describe('isCurrentPositionTop(): boolean', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();
        });

        it('should be true when cursor in the start line of editor.', () => {
            component._editor.setPosition({
                lineNumber: 1,
                column: 0,
            });

            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('isCurrentPositionBottom(): boolean', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();
        });

        it('if editor has only one line, it should be true on both top and bottom.', () => {
            expect(component.isCurrentPositionTop()).toBe(true);
            expect(component.isCurrentPositionBottom()).toBe(true);
        });

        it('should be true when cursor in the last line of editor', () => {
            component.setValue('hello\nworld!');
            component._editor.setPosition({
                lineNumber: 2,
                column: 0,
            });

            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('setPositionToTop(): void', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();
        });

        it('should cursor located at first line.', () => {
            component.setValue('Some long\nparagraph');
            component._editor.setPosition({
                lineNumber: 2,
                column: 0,
            });
            expect(component.isCurrentPositionTop()).toBe(false);

            component.setPositionToTop();
            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('setPositionToBottom(): void', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();
        });

        it('should cursor located at last line.', () => {
            component.setValue('Some long\nparagraph.');
            expect(component.isCurrentPositionBottom()).toBe(false);

            component.setPositionToBottom();
            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('typing', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();
        });

        it('should dispatch \'REMOVE_THIS\' action when press a backspace ' +
            'with a blank value', () => {

            const inputField = getInputField();

            component.setValue('');

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.BACKSPACE);

            expect(store.dispatch).toHaveBeenCalledWith(
                new RemoveSnippetAction({ snippetId: 'noteId' }));
        });

        it('should dispatch \'MOVE_FOCUS_TO_PREVIOUS\' action when press a up arrow ' +
            'and current cursor in top of lines.', () => {

            const inputField = getInputField();

            component.setPositionToTop();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.UP_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToPreviousSnippetAction({ snippetId: 'noteId' }));
        });

        it('should dispatch \'MOVE_FOCUS_TO_NEXT\' action when press a down arrow ' +
            'and current cursor in bottom of lines.', () => {

            const inputField = getInputField();

            component.setPositionToBottom();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.DOWN_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToNextSnippetAction({ snippetId: 'noteId' }));
        });
    });

    describe('setting', () => {
        beforeEach(async(() => {
            configureTestBed();
        }));

        beforeEach(() => {
            createFixture();

            mockDialog = TestBed.get(Dialog);
            store = TestBed.get(Store);

            spyOn(store, 'dispatch').and.callThrough();
        });

        it('should update settings and dispatch \'UPDATE_SNIPPET_CONTENT\' action ' +
            'after snippet setting dialog submitted with patch.', () => {
            const patch = {
                language: 'modified-language',
                fileName: 'modified-fileName',
            };

            const settingButton = fixture.debugElement.query(
                By.css('button[aria-label=setting-button]'));

            settingButton.nativeElement.click();
            fixture.detectChanges();

            expect(mockDialog.openDialog).toEqual(NoteEditorSnippetSettingDialogComponent);
            expect(mockDialog.openDialogConfig.data).toEqual(component._config);

            mockDialog.dialogRef.close(patch);
            fixture.detectChanges();

            expect(component._config.language).toEqual('modified-language');

            const expected = new UpdateSnippetContentAction({
                snippetId: component.id,
                patch,
            });

            expect(store.dispatch).toHaveBeenCalledWith(expected);
        });
    });
});
