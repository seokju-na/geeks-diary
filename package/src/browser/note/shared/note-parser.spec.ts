import { TestBed } from '@angular/core/testing';
import { MockFsService } from '../../../../test/mocks/browser/mock-fs.service';
import { FsService } from '../../core/fs.service';
import { WorkspaceService } from '../../core/workspace.service';
import { NoteParser } from './note-parser';


describe('NoteParser', () => {
    let parser: NoteParser;

    let mockFs: MockFsService;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    ...MockFsService.providersForTesting,
                    WorkspaceService,
                    NoteParser,
                ],
            });
    });

    beforeEach(() => {
        parser = TestBed.get(NoteParser);
        mockFs = TestBed.get(FsService);
    });
});
