import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { MockFsService } from '../../../../test/mocks/browser/mock-fs.service';
import { Note } from '../../../models/note';
import { FsService } from '../../core/fs.service';
import { NoteContentDummy, NoteDummy, NoteItemDummy } from '../dummies';
import { DeselectNoteAction, SelectNoteAction } from './note-collection.actions';
import { NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE, NoteContentEffects } from './note-content.effects';
import { NoteContent } from './note-content.model';
import {
    CancelNoteContentLoadingAction,
    LoadNoteContentAction,
    LoadNoteContentCompleteAction,
    LoadNoteContentErrorAction,
} from './note-editor.actions';
import { NoteEditorService } from './note-editor.service';
import { NoteItem } from './note-item.model';
import { NoteParser } from './note-parser';


describe('browser.note.NoteContentEffects', () => {
    let effects: NoteContentEffects;
    let actions: ReplaySubject<Action>;
    let parser: NoteParser;
    let editor: NoteEditorService;
    let mockFs: MockFsService;

    beforeEach(() => {
        actions = new ReplaySubject<Action>(1);
        parser = jasmine.createSpyObj('parser', [
            'generateNoteContent',
        ]);
        editor = jasmine.createSpyObj('editor', [
            'loadNoteContent',
            'dispose',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ...MockFsService.providersForTesting,
                { provide: NoteParser, useValue: parser },
                { provide: NoteEditorService, useValue: editor },
                NoteContentEffects,
                provideMockActions(() => actions),
            ],
        });
    });

    beforeEach(() => {
        effects = TestBed.get(NoteContentEffects);
        parser = TestBed.get(NoteParser);
        mockFs = TestBed.get(FsService);
    });

    afterEach(() => {
        mockFs.verify();
    });

    describe('onSelectNote', () => {
        let note: NoteItem;

        beforeEach(() => {
            note = new NoteItemDummy().create();
        });

        it('should call editor service.', () => {
            const callback = jasmine.createSpy('on select note spy');
            const subscription = effects.onSelectNote.subscribe(callback);

            actions.next(new SelectNoteAction({ note }));

            expect(editor.loadNoteContent).toHaveBeenCalledWith(note);

            subscription.unsubscribe();
        });
    });

    describe('onDeselectNote', () => {
        it('should call editor service.', () => {
            const callback = jasmine.createSpy('on deselect note spy');
            const subscription = effects.onDeselectNote.subscribe(callback);

            actions.next(new DeselectNoteAction());

            expect(editor.dispose).toHaveBeenCalled();

            subscription.unsubscribe();
        });
    });

    describe('load', () => {
        let note: Note;
        let noteItem: NoteItem;
        let content: NoteContent;

        beforeEach(() => {
            note = new NoteDummy().create();
            noteItem = new NoteItemDummy().createFromNote(note);
            content = new NoteContentDummy().create();
        });

        it('should dispatch \'LOAD_NOTE_CONTENT_COMPLETE\' action ' +
            'with note content after debounce time.', fakeAsync(() => {
            (<jasmine.Spy>parser.generateNoteContent).and.returnValue(content);

            const action = new LoadNoteContentAction({ note: noteItem });
            const expected = new LoadNoteContentCompleteAction({ content });

            const callback = jasmine.createSpy('load callback');
            const subscription = effects.load.subscribe(callback);

            actions.next(action);

            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE + 100);

            mockFs
                .expect<Note>({
                    methodName: 'readJsonFile',
                    args: [noteItem.filePath],
                })
                .flush(note);

            mockFs
                .expect<string>({
                    methodName: 'readFile',
                    args: [noteItem.contentFilePath],
                })
                .flush('some content');

            expect(parser.generateNoteContent)
                .toHaveBeenCalledWith(note, 'some content');

            expect(callback).toHaveBeenCalledWith(expected);

            subscription.unsubscribe();
        }));

        it('should not dispatch \'LOAD_NOTE_CONTENT_COMPLETE\' ' +
            'action if cancel action received before during the debouncing time.', fakeAsync(() => {
            const action = new LoadNoteContentAction({ note: noteItem });
            const notExpected = new LoadNoteContentCompleteAction({ content });

            const callback = jasmine.createSpy('load callback');
            const subscription = effects.load.subscribe(callback);

            actions.next(action);

            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE - 100);

            actions.next(new CancelNoteContentLoadingAction());

            expect(callback).not.toHaveBeenCalledWith(notExpected);

            subscription.unsubscribe();
        }));

        it('should not dispatch \'LOAD_NOTE_CONTENT_COMPLETE\' ' +
            'action if cancel action received before after the debouncing time.', fakeAsync(() => {
            (<jasmine.Spy>parser.generateNoteContent).and.returnValue(content);

            const action = new LoadNoteContentAction({ note: noteItem });
            const notExpected = new LoadNoteContentCompleteAction({ content });

            const callback = jasmine.createSpy('load callback');
            const subscription = effects.load.subscribe(callback);

            actions.next(action);

            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE + 100);

            actions.next(new CancelNoteContentLoadingAction());

            mockFs
                .expect<Note>({
                    methodName: 'readJsonFile',
                    args: [noteItem.filePath],
                })
                .flush(note);

            mockFs
                .expect<string>({
                    methodName: 'readFile',
                    args: [noteItem.contentFilePath],
                })
                .flush('some content');

            expect(callback).not.toHaveBeenCalledWith(notExpected);

            subscription.unsubscribe();
        }));

        it('should dispatch \'LOAD_NOTE_CONTENT_ERROR\' action ' +
            'if got error.', fakeAsync(() => {
            const action = new LoadNoteContentAction({ note: noteItem });
            const expected = new LoadNoteContentErrorAction(new Error('some error'));

            const callback = jasmine.createSpy('load callback');
            const subscription = effects.load.subscribe(callback);

            actions.next(action);

            tick(NOTE_EDITOR_LOAD_NOTE_CONTENT_THROTTLE + 100);

            mockFs
                .expect<Note>({
                    methodName: 'readJsonFile',
                    args: [noteItem.filePath],
                })
                .flush(note);

            mockFs
                .expect<string>({
                    methodName: 'readFile',
                    args: [noteItem.contentFilePath],
                })
                .error(new Error('some error'));

            expect(callback).toHaveBeenCalledWith(expected);

            subscription.unsubscribe();
        }));
    });
});
