import { DatePipe } from '@angular/common';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../test/helpers';
import { FsMatchLiterals, MockFsService } from '../../../../test/mocks/browser';
import { Asset, AssetTypes } from '../../../core/asset';
import { FsService, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig, WorkspaceService } from '../../shared';
import { basicFixture } from '../fixtures';
import { NoteParser } from '../note-shared';
import { NoteEditorService } from './note-editor.service';


describe('browser.note.noteEditor.NoteEditorService', () => {
    let noteEditor: NoteEditorService;
    let mockFs: MockFsService;

    const workspaceConfig: WorkspaceConfig = {
        assetsDirPath: '/test/assets',
    };

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
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                    WorkspaceService,
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

    describe('copyAssetFile', () => {
        it('should copy file and return asset model.', fakeAsync(() => {
            const file = { path: '/foo/bar/some-image.png' };

            const callback = jasmine.createSpy('copy asset file callback');
            const subscription = noteEditor.copyAssetFile(AssetTypes.IMAGE, file as any).subscribe(callback);

            mockFs
                .expect({
                    methodName: 'copyFile',
                    args: [file.path, `${workspaceConfig.assetsDirPath}/some-image.png`, FsMatchLiterals.ANY],
                })
                .flush(null);

            expect(callback).toHaveBeenCalledWith({
                type: AssetTypes.IMAGE,
                fileName: 'some-image.png',
                filePath: `${workspaceConfig.assetsDirPath}/some-image.png`,
                extension: '.png',
            } as Asset);
            subscription.unsubscribe();
        }));
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

            mockFs
                .expectMany([
                    {
                        methodName: 'writeJsonFile',
                        args: [basicFixture.noteItem.filePath, FsMatchLiterals.ANY],
                    },
                    {
                        methodName: 'writeFile',
                        args: [
                            basicFixture.note.contentFilePath,
                            FsMatchLiterals.ANY,
                        ],
                    },
                ])
                .forEach(stub => stub.flush());

            expect(callback).toHaveBeenCalled();
            subscription.unsubscribe();
        }));
    });
});
