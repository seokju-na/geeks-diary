import { DatePipe } from '@angular/common';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../test/helpers';
import { FsMatchLiterals, MockFsService } from '../../../../test/mocks/browser';
import { FsService } from '../../shared';
import { basicFixture } from '../fixtures';
import { NoteParser } from '../note-shared';
import { NoteEditorService } from './note-editor.service';


describe('browser.note.noteEditor.NoteEditorService', () => {
    let noteEditor: NoteEditorService;
    let mockFs: MockFsService;

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                imports: [],
                providers: [
                    DatePipe,
                    NoteParser,
                    ...MockFsService.providers(),
                    NoteEditorService,
                ],
            });
    });

    beforeEach(() => {
        noteEditor = TestBed.get(NoteEditorService);
        mockFs = TestBed.get(FsService);
    });

    afterEach(() => {
        mockFs.verify();
    });

    describe('loadNoteContent', () => {
        it('should load files and parse to note content.', fakeAsync(() => {
            const callback = jasmine.createSpy('load note content callback');
            const subscription = noteEditor.loadNoteContent(basicFixture.noteItem).subscribe(callback);

            const stubs = mockFs.expectMany([
                {
                    methodName: 'readJsonFile',
                    args: [basicFixture.noteItem.filePath],
                },
                {
                    methodName: 'readFile',
                    args: [basicFixture.noteItem.contentFilePath],
                },
            ]);

            stubs[0].flush(basicFixture.note);
            stubs[1].flush(basicFixture.contentRawValue);

            expect(callback).toHaveBeenCalledWith(basicFixture.content);
            subscription.unsubscribe();
        }));
    });

    describe('saveNote', () => {
        it('should write note and content file.', fakeAsync(() => {
            const callback = jasmine.createSpy('save note callback');
            const subscription = noteEditor.saveNote(
                basicFixture.noteItem,
                basicFixture.content,
            ).subscribe(callback);

            const stubs = mockFs.expectMany([
                {
                    methodName: 'writeJsonFile',
                    args: [basicFixture.noteItem.filePath, FsMatchLiterals.ANY],
                },
                {
                    methodName: 'writeFile',
                    args: [
                        basicFixture.note.contentFilePath,
                        basicFixture.contentParsedValue,
                    ],
                },
            ]);

            stubs[0].flush();
            stubs[1].flush();

            expect(callback).toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });
});
