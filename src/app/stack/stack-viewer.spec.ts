import { fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { readFile } from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import { promisify } from 'util';
import { environment } from '../../environments/environment';
import { MockFsService } from '../../testing/mock-fs.service';
import { FsService } from '../core/fs.service';
import { StackViewer } from './stack-viewer';


describe('app.stack.StackViewer', () => {
    let stackViewer: StackViewer;
    let mockFsService: MockFsService;

    let mapFileData: Buffer;

    beforeAll(async () => {
        await fse.copy(
            'src/assets/', path.resolve(environment.config.basePath, 'assets/'));

        const readFileAsync = promisify(readFile);

        mapFileData = await readFileAsync(
            path.resolve(environment.config.basePath, 'assets/vendors/devicon/devicon.json'));
    });

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                providers: [
                    ...MockFsService.providersForTesting,
                    StackViewer,
                ],
            });
    });

    beforeEach(inject(
        [StackViewer, FsService],
        (s: StackViewer, mfs: MockFsService) => {
            stackViewer = s;
            mockFsService = mfs;
        }));

    afterAll(async () => {
        await fse.remove(path.resolve(environment.config.basePath, 'assets/'));
        mapFileData = null;
    });

    it('should fetch stack items.', fakeAsync(() => {
        const stacksCallback = jasmine.createSpy('stacks');
        stackViewer.stacks().subscribe(stacksCallback);
        flush();

        mockFsService
            .expect<Buffer>({
                methodName: 'readFile',
                args: [StackViewer.iconMapFilePath, 'utf8'],
            })
            .flush(mapFileData);

        expect(stacksCallback.calls.mostRecent().args).not.toEqual([]);
    }));
});
