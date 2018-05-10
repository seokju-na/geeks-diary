import { fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import * as path from 'path';
import { MockFsService } from '../../testing/mock';
import { FsService } from '../core/fs.service';
import { NoteContentDummyFactory, NoteMetadataDummyFactory } from './dummies';
import { NoteContent, NoteMetadata } from './models';
import { NoteFsService } from './note-fs.service';


interface NoteMap {
    metadata: NoteMetadata;
    content: NoteContent;
    fileName?: string;
}


describe('app.note.NoteFsService', () => {
    let noteFsService: NoteFsService;
    let mockFsService: MockFsService;

    let notes: NoteMap[];

    beforeEach(() => {
        notes = [];

        const metadataDummyFactory = new NoteMetadataDummyFactory();

        for (let i = 0; i < 10; i++) {
            const metadata = metadataDummyFactory.create();
            const content = new NoteContentDummyFactory().create(metadata.id);

            notes.push({
                metadata,
                content,
                fileName: NoteFsService.getFileNameFromMetadata(metadata),
            });
        }
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    ...MockFsService.providersForTesting,
                    NoteFsService,
                ],
            });
    });

    beforeEach(inject(
        [NoteFsService, FsService],
        (n: NoteFsService, m: MockFsService) => {
            noteFsService = n;
            mockFsService = m;
        },
    ));

    afterEach(() => {
        mockFsService.verify();
    });

    describe('readNoteMetadataCollection', () => {
        it('should read all metadata in note files and return it.', fakeAsync(() => {
            const callback = jasmine.createSpy('callback');

            noteFsService.readNoteMetadataCollection().subscribe(callback);
            flush();

            mockFsService
                .expect({
                    methodName: 'readDirectory',
                    args: [noteFsService.noteStoragePath],
                })
                .flush(notes.map(note => note.fileName));

            const matchObjList = notes.map(note => ({
                methodName: 'readFile',
                args: [
                    noteFsService.getMetadataFileName(
                        path.resolve(noteFsService.noteStoragePath, note.fileName)),
                    'utf8',
                ],
            }));

            const stubs = mockFsService.expectMany(matchObjList);

            stubs.forEach((stub, index) => {
                stub.flush(Buffer.from(JSON.stringify(notes[index].metadata)));
            });

            const expected = notes.map(note => ({
                ...note.metadata,
                noteFileName: path.resolve(noteFsService.noteStoragePath, note.fileName),
                fileName: path.resolve(
                    noteFsService.noteStoragePath, note.fileName, NoteFsService.metadataFileName),
            }));

            expect(callback).toHaveBeenCalledWith(expected);
        }));
    });

    describe('readNoteMetadata', () => {
        it('should read metadata file and return null, on error.', fakeAsync(() => {
            const noteFileName = '/test/note.gd';
            const metadataFileName = noteFsService.getMetadataFileName(noteFileName);

            const callback = jasmine.createSpy('callback');

            noteFsService.readNoteMetadata(noteFileName).subscribe(callback);
            flush();

            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [metadataFileName, 'utf8'],
                })
                .error(null);

            expect(callback).toHaveBeenCalledWith(null);
        }));

        it('should read metadata file and return data, on success.', fakeAsync(() => {
            const noteFileName = '/test/note.gd';
            const metadataFileName = noteFsService.getMetadataFileName(noteFileName);
            const metadata = new NoteMetadataDummyFactory().create();

            metadata.noteFileName = noteFileName;
            metadata.fileName = noteFsService.getMetadataFileName(noteFileName);

            const callback = jasmine.createSpy('callback');

            noteFsService.readNoteMetadata(noteFileName).subscribe(callback);
            flush();

            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [metadataFileName, 'utf8'],
                })
                .flush(Buffer.from(JSON.stringify(metadata)));

            expect(callback).toHaveBeenCalledWith(metadata);
        }));
    });

    describe('readNoteContent', () => {
        it('should read content file and return null, on error.', fakeAsync(() => {
            const noteFileName = '/test/note.gd';
            const contentFileName = noteFsService.getContentFileName(noteFileName);

            const callback = jasmine.createSpy('callback');

            noteFsService.readNoteContent(noteFileName).subscribe(callback);
            flush();

            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [contentFileName, 'utf8'],
                })
                .error(null);

            expect(callback).toHaveBeenCalledWith(null);
        }));

        it('should read content file and return data, on success.', fakeAsync(() => {
            const noteFileName = '/test/note.gd';
            const contentFileName = noteFsService.getContentFileName(noteFileName);
            const content = new NoteContentDummyFactory().create();

            content.noteFileName = noteFileName;
            content.fileName = contentFileName;

            const callback = jasmine.createSpy('callback');

            noteFsService.readNoteContent(noteFileName).subscribe(callback);
            flush();

            mockFsService
                .expect({
                    methodName: 'readFile',
                    args: [contentFileName, 'utf8'],
                })
                .flush(Buffer.from(JSON.stringify(content)));

            expect(callback).toHaveBeenCalledWith(content);
        }));
    });

    describe('writeNoteMetadata', () => {
        it('should write note metadata at metadata file.', fakeAsync(() => {
            const metadata = new NoteMetadataDummyFactory().create();
            metadata.fileName = '/test/note.gd/meta.json';

            noteFsService.writeNoteMetadata(metadata).subscribe();
            flush();

            mockFsService
                .expect({
                    methodName: 'writeFile',
                    args: [
                        metadata.fileName,
                        NoteFsService.convertMetadataToValue(metadata),
                        'utf8',
                    ],
                })
                .flush();
        }));
    });

    describe('writeNoteContent', () => {
        it('should write note content at content file.', fakeAsync(() => {
            const content = new NoteContentDummyFactory().create();
            content.fileName = '/test/note.gd/content.json';

            noteFsService.writeNoteContent(content).subscribe();
            flush();

            mockFsService
                .expect({
                    methodName: 'writeFile',
                    args: [
                        content.fileName,
                        NoteFsService.convertContentToValue(content),
                        'utf8',
                    ],
                })
                .flush();
        }));
    });
});
