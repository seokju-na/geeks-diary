import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { KeyCodes } from '../../../../common/key-codes';
import { dispatchKeyboardEvent } from '../../../../testing/fake-event';
import { SharedModule } from '../../../shared/shared.module';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
} from '../../actions';
import { noteReducerMap, NoteStateWithRoot } from '../../reducers';
import {
    NOTE_EDITOR_SNIPPET_CONFIG,
    NOTE_EDITOR_SNIPPET_REF,
    NoteEditorSnippetConfig,
    NoteEditorSnippetRef,
} from './snippet';
import { NoteEditorTextSnippetComponent } from './text-snippet.component';


describe('app.note.editor.snippet.EditorTextSnippetComponent', () => {
    let fixture: ComponentFixture<NoteEditorTextSnippetComponent>;
    let component: NoteEditorTextSnippetComponent;

    let ref: NoteEditorSnippetRef;
    let config: NoteEditorSnippetConfig;

    let store: Store<NoteStateWithRoot>;

    const overrideConfig = (newConfig: Partial<NoteEditorSnippetConfig>) => {
        config = { ...config, ...newConfig };

        TestBed.overrideProvider(NOTE_EDITOR_SNIPPET_CONFIG, {
            useValue: newConfig,
        });
    };

    const createFixture = () => {
        fixture = TestBed.createComponent(NoteEditorTextSnippetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(() => {
        ref = new NoteEditorSnippetRef('noteId');
        config = {
            initialValue: 'initial value',
            isNewSnippet: false,
        };
    });

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    { provide: NOTE_EDITOR_SNIPPET_REF, useValue: ref },
                    { provide: NOTE_EDITOR_SNIPPET_CONFIG, useValue: config },
                ],
                declarations: [NoteEditorTextSnippetComponent],
            })
            .compileComponents();
    }));

    afterEach(() => {
        if (fixture) {
            fixture.debugElement.nativeElement.remove();
        }
    });

    describe('initialize', () => {
        it('should show initial value when initialized editor.', () => {
            createFixture();
            expect(component.getValue()).toEqual(config.initialValue);
        });
    });

    describe('isCurrentPositionTop(): boolean', () => {
        it('should be true when cursor in the start line of editor.', () => {
            createFixture();

            component._editor.getDoc().setCursor({ line: 0, ch: 0 });

            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('isCurrentPositionBottom(): boolean', () => {
        beforeEach(() => {
            createFixture();
        });

        it('if editor has only one line, it should be true on both top and bottom.', () => {
            expect(component.isCurrentPositionTop()).toBe(true);
            expect(component.isCurrentPositionBottom()).toBe(true);
        });

        it('should be true when cursor in the last line of editor', () => {
            component.setValue('hello\nworld!');
            component._editor.getDoc().setCursor({ line: 1, ch: 0 });

            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('setPositionToTop(): void', () => {
        it('should cursor located at first line.', () => {
            overrideConfig({ initialValue: 'Some long\nparagraph' });
            createFixture();

            component._editor.getDoc().setCursor({ line: 1, ch: 0 });
            expect(component.isCurrentPositionTop()).toBe(false);

            component.setPositionToTop();
            expect(component.isCurrentPositionTop()).toBe(true);
        });
    });

    describe('setPositionToBottom(): void', () => {
        it('should cursor located at last line.', () => {
            overrideConfig({ initialValue: 'Some long\nparagraph' });
            createFixture();

            expect(component.isCurrentPositionBottom()).toBe(false);

            component.setPositionToBottom();
            expect(component.isCurrentPositionBottom()).toBe(true);
        });
    });

    describe('typing', () => {
        beforeEach(() => {
            createFixture();

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();
        });

        it('should fire \'REMOVE_THIS\' event when press a backspace with a blank value', () => {
            const inputField = component._editor.getInputField();

            component.setValue('');

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.BACKSPACE);

            expect(store.dispatch).toHaveBeenCalledWith(
                new RemoveSnippetAction({ snippetId: 'noteId' }));
        });

        it('should fire \'MOVE_FOCUS_TO_PREVIOUS\' event when press a up arrow ' +
            'and current cursor in top of lines.', () => {

            const inputField = component._editor.getInputField();

            component.setPositionToTop();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.UP_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToPreviousSnippetAction({ snippetId: 'noteId' }));
        });

        it('should fire \'MOVE_FOCUS_TO_NEXT\' event when press a down arrow ' +
            'and current cursor in bottom of lines.', () => {

            const inputField = component._editor.getInputField();

            component.setPositionToBottom();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.DOWN_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToNextSnippetAction({ snippetId: 'noteId' }));
        });
    });
});
