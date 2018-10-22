import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, combineReducers, StoreModule } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { fastTestSetup } from '../../../../test/helpers';
import { SelectNoteAction } from '../note-collection';
import { NoteItemDummy } from '../note-collection/dummies';
import { noteReducerMap } from '../note.reducer';
import { NoteContentDummy } from './dummies';
import { LoadNoteContentAction, LoadNoteContentCompleteAction } from './note-editor.actions';
import { NoteEditorEffects } from './note-editor.effects';
import { NoteSnippetListManager } from './note-snippet-list-manager';


describe('browser.note.noteEditor.NoteEditorEffects', () => {
    let effects: NoteEditorEffects;

    let actions: ReplaySubject<Action>;
    let snippetListManager: NoteSnippetListManager;

    const noteItemDummy = new NoteItemDummy();
    const noteContentDummy = new NoteContentDummy();

    fastTestSetup();

    beforeAll(() => {
        actions = new ReplaySubject<Action>(1);
        snippetListManager = jasmine.createSpyObj('snippetListManager', [
            'removeAllSnippets',
            'addAllSnippetsFromContent',
        ]);

        TestBed
            .configureTestingModule({
                imports: [
                    StoreModule.forRoot({
                        note: combineReducers(noteReducerMap),
                    }),
                ],
                providers: [
                    { provide: NoteSnippetListManager, useValue: snippetListManager },
                    NoteEditorEffects,
                    provideMockActions(() => actions),
                ],
            });
    });

    beforeEach(() => {
        effects = TestBed.get(NoteEditorEffects);
    });

    describe('loadNoteContentWhenNoteSelected', () => {
        it('should return \'LOAD_NOTE_CONTENT\' action.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.loadNoteContentWhenNoteSelected.subscribe(callback);

            const note = noteItemDummy.create();

            actions.next(new SelectNoteAction({ note }));

            expect(callback).toHaveBeenCalledWith(new LoadNoteContentAction({ note: note }));
            subscription.unsubscribe();
        });
    });

    describe('afterNoteContentLoaded', () => {
        it('should call \'removeAllSnippets\' and \'addAllSnippetsFromContent\' from note snippet '
            + 'list manager for side effects.', () => {
            const callback = jasmine.createSpy('callback');
            const subscription = effects.afterNoteContentLoaded.subscribe(callback);

            const note = noteItemDummy.create();
            const content = noteContentDummy.createFromNote(note);

            actions.next(new LoadNoteContentCompleteAction({ note, content }));

            expect(snippetListManager.removeAllSnippets).toHaveBeenCalled();
            expect(snippetListManager.addAllSnippetsFromContent).toHaveBeenCalledWith(content);

            subscription.unsubscribe();
        });
    });
});
