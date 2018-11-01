import { DatePipe } from '@angular/common';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { fastTestSetup } from '../../../../test/helpers';
import { FsMatchLiterals, MockDialog, MockFsService } from '../../../../test/mocks/browser';
import { Asset, AssetTypes } from '../../../core/asset';
import { FsService, SharedModule, WORKSPACE_DEFAULT_CONFIG, WorkspaceConfig } from '../../shared';
import {
    ChangeFileNameDialogComponent,
    ChangeFileNameDialogData,
    ChangeFileNameDialogResult,
} from '../../shared/change-file-name-dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog';
import { Dialog } from '../../ui/dialog';
import { basicFixture } from '../fixtures';
import { NoteParser } from '../note-shared';
import { NoteEditorService } from './note-editor.service';


describe('browser.note.noteEditor.NoteEditorService', () => {
    let noteEditor: NoteEditorService;
    let mockFs: MockFsService;
    let mockDialog: MockDialog;

    const workspaceConfig: WorkspaceConfig = {
        rootDirPath: '/test/workspace',
        assetsDirPath: '/test/workspace/assets',
    };

    fastTestSetup();

    beforeAll(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    SharedModule,
                    ...MockDialog.imports(),
                ],
                providers: [
                    DatePipe,
                    NoteParser,
                    ...MockFsService.providers(),
                    ...MockDialog.providers(),
                    NoteEditorService,
                    { provide: WORKSPACE_DEFAULT_CONFIG, useValue: workspaceConfig },
                ],
            });
    });

    beforeEach(() => {
        noteEditor = TestBed.get(NoteEditorService);
        mockFs = TestBed.get(FsService);
        mockDialog = TestBed.get(Dialog);
    });

    afterEach(() => {
        mockFs.verify();
        mockDialog.closeAll();
    });

    describe('copyAssetFile', () => {
        it('should copy file and return asset model.', fakeAsync(() => {
            const filePath = '/foo/bar/some-image.png';

            const callback = jasmine.createSpy('copy asset file callback');
            const subscription = noteEditor.copyAssetFile(AssetTypes.IMAGE, filePath).subscribe(callback);

            mockFs
                .expect({
                    methodName: 'copyFile',
                    args: [filePath, `${workspaceConfig.assetsDirPath}/some-image.png`, FsMatchLiterals.ANY],
                })
                .flush(null);

            expect(callback).toHaveBeenCalledWith({
                type: AssetTypes.IMAGE,
                fileName: 'some-image.png',
                fileNameWithoutExtension: 'some-image',
                filePath: `${workspaceConfig.assetsDirPath}/some-image.png`,
                extension: '.png',
                relativePathToWorkspaceDir: 'assets/some-image.png',
            } as Asset);
            subscription.unsubscribe();
        }));

        it('1) File already exists. '
            + '2) Open confirm dialog for asking user whether change file name. '
            + '3) If accepted, copy asset file again with changed file name.', fakeAsync(() => {
            const filePath = '/foo/bar/some-image.png';

            const callback = jasmine.createSpy('copy asset file callback');
            const subscription = noteEditor.copyAssetFile(AssetTypes.IMAGE, filePath).subscribe(callback);

            mockFs
                .expect({
                    methodName: 'copyFile',
                    args: [filePath, `${workspaceConfig.assetsDirPath}/some-image.png`, FsMatchLiterals.ANY],
                })
                .error(new Error('File already exists'));

            // Open confirm dialog.
            const confirmDialogRef = mockDialog.getByComponent<ConfirmDialogComponent,
                ConfirmDialogData,
                boolean>(
                ConfirmDialogComponent,
            );

            expect(confirmDialogRef).toBeDefined();
            expect(confirmDialogRef.config.data.confirmButtonString).toEqual('Change');
            expect(confirmDialogRef.config.data.body)
                .toEqual('\'some-image.png\' is already exists in assets directory. Do you want to rename the file?');

            confirmDialogRef.close(true);
            flush();

            // Open change file name dialog to avoid same name of file.
            const changeFileNameDialogRef = mockDialog.getByComponent<ChangeFileNameDialogComponent,
                ChangeFileNameDialogData,
                ChangeFileNameDialogResult>(
                ChangeFileNameDialogComponent,
            );

            expect(changeFileNameDialogRef).toBeDefined();
            expect(changeFileNameDialogRef.config.data.directoryPath).toEqual(workspaceConfig.assetsDirPath);
            expect(changeFileNameDialogRef.config.data.fileName).toEqual('some-image.png');

            changeFileNameDialogRef.close({
                isChanged: true,
                changedFileName: 'other-image.png',
            });
            flush();

            // Copy again.
            mockFs
                .expect({
                    methodName: 'copyFile',
                    args: [filePath, `${workspaceConfig.assetsDirPath}/other-image.png`, FsMatchLiterals.ANY],
                })
                .flush(null);

            expect(callback).toHaveBeenCalledWith({
                type: AssetTypes.IMAGE,
                fileName: 'other-image.png',
                fileNameWithoutExtension: 'other-image',
                filePath: `${workspaceConfig.assetsDirPath}/other-image.png`,
                extension: '.png',
                relativePathToWorkspaceDir: 'assets/other-image.png',
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
