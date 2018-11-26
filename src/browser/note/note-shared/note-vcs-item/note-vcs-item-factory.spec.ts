import { TestBed } from '@angular/core/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as path from 'path';
import { createDummies, fastTestSetup } from '../../../../../test/helpers';
import { VcsFileChange, VcsFileChangeStatusTypes } from '../../../../core/vcs';
import { LoadNoteCollectionCompleteAction } from '../../note-collection';
import { NoteItemDummy } from '../../note-collection/dummies';
import { noteReducerMap } from '../../note.reducer';
import { NoteStateWithRoot } from '../../note.state';
import { NoteVcsItemFactory } from './note-vcs-item-factory';
import { NoteVcsItemComponent } from './note-vcs-item.component';


describe('browser.note.noteShared.NoteVcsItemFactory', () => {
    let factory: NoteVcsItemFactory;

    let store: Store<NoteStateWithRoot>;

    const noteItemDummy = new NoteItemDummy('/foo/bar', '/foo/bar/.geeks-diary/notes');

    fastTestSetup();

    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({
                    note: combineReducers(noteReducerMap),
                }),
            ],
            providers: [
                NoteVcsItemFactory,
            ],
        });
    });

    beforeEach(() => {
        factory = TestBed.get(NoteVcsItemFactory);
        store = TestBed.get(Store);
    });

    it('should output result correctly.', async () => {
        const notes = createDummies(noteItemDummy, 5);
        const fileChanges: VcsFileChange[] = notes.reduce((changes, note) => {
            const noteFileChange: VcsFileChange = {
                filePath: path.relative('/foo/bar', note.filePath),
                absoluteFilePath: note.filePath,
                workingDirectoryPath: '/foo/bar',
                status: VcsFileChangeStatusTypes.MODIFIED,
            };

            const noteContentFileChange: VcsFileChange = {
                filePath: path.relative('/foo/bar', note.contentFilePath),
                absoluteFilePath: note.contentFilePath,
                workingDirectoryPath: '/foo/bar',
                status: VcsFileChangeStatusTypes.MODIFIED,
            };

            return changes.concat([noteFileChange, noteContentFileChange]);
        }, []);

        store.dispatch(new LoadNoteCollectionCompleteAction({ notes }));

        const result = await factory.create(fileChanges);

        expect(result.refs.length).toEqual(5);
        result.refs.forEach((ref, index) => {
            expect(ref._config.title).toEqual(notes[index].title);
            expect(ref._config.fileChanges).toEqual([fileChanges[index * 2], fileChanges[index * 2 + 1]]);
            expect(ref.component).toEqual(NoteVcsItemComponent);
        });
    });
});
