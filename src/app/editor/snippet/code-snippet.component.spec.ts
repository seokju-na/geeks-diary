import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { KeyCodes } from '../../../common/key-codes';
import { dispatchKeyboardEvent } from '../../../testing/fake-event';
import { MonacoService } from '../../core/monaco.service';
import { SharedModule } from '../../shared/shared.module';
import {
    MoveFocusToNextSnippetAction,
    MoveFocusToPreviousSnippetAction,
    RemoveSnippetAction,
} from '../actions';
import { editorReducerMap, EditorStateForFeature } from '../reducers';
import { EditorCodeSnippetComponent } from './code-snippet.component';
import {
    EDITOR_SNIPPET_CONFIG,
    EDITOR_SNIPPET_REF,
    EditorSnippetConfig,
    EditorSnippetRef,
} from './snippet';


describe('app.editor.snippet.EditorCodeSnippetComponent', () => {
    let fixture: ComponentFixture<EditorCodeSnippetComponent>;
    let component: EditorCodeSnippetComponent;

    let ref: EditorSnippetRef;
    let config: EditorSnippetConfig;

    let store: Store<EditorStateForFeature>;

    const getInputField = (): HTMLTextAreaElement =>
        document.querySelector('.monaco-editor .inputarea');

    const overrideConfig = (newConfig: Partial<EditorSnippetConfig>) => {
        config = { ...config, ...newConfig };

        TestBed.overrideProvider(EDITOR_SNIPPET_CONFIG, {
            useValue: newConfig,
        });
    };

    const createFixture = () => {
        fixture = TestBed.createComponent(EditorCodeSnippetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    };

    beforeEach(() => {
        ref = new EditorSnippetRef('noteId');
        config = {
            initialValue: 'initial value',
            language: 'javascript',
            isNewSnippet: false,
        };
    });

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    StoreModule.forRoot({
                        editor: combineReducers(editorReducerMap),
                    }),
                ],
                providers: [
                    MonacoService,
                    { provide: EDITOR_SNIPPET_REF, useValue: ref },
                    { provide: EDITOR_SNIPPET_CONFIG, useValue: config },
                ],
                declarations: [EditorCodeSnippetComponent],
            })
            .compileComponents();
    }));

    afterEach(() => {
        if (fixture) {
            fixture.debugElement.nativeElement.remove();
        }
    });

    describe('initialize', () => {
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
        beforeEach(() => {
            createFixture();

            store = TestBed.get(Store);
            spyOn(store, 'dispatch').and.callThrough();
        });

        it('should fire \'REMOVE_THIS\' event when press a backspace with a blank value', () => {
            const inputField = getInputField();

            component.setValue('');

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.BACKSPACE);

            expect(store.dispatch).toHaveBeenCalledWith(
                new RemoveSnippetAction({ snippetId: 'noteId' }));
        });

        it('should fire \'MOVE_FOCUS_TO_PREVIOUS\' event when press a up arrow ' +
            'and current cursor in top of lines.', () => {

            const inputField = getInputField();

            component.setPositionToTop();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.UP_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToPreviousSnippetAction({ snippetId: 'noteId' }));
        });

        it('should fire \'MOVE_FOCUS_TO_NEXT\' event when press a down arrow ' +
            'and current cursor in bottom of lines.', () => {

            const inputField = getInputField();

            component.setPositionToBottom();

            dispatchKeyboardEvent(inputField, 'keydown', KeyCodes.DOWN_ARROW);

            expect(store.dispatch).toHaveBeenCalledWith(
                new MoveFocusToNextSnippetAction({ snippetId: 'noteId' }));
        });
    });
});
