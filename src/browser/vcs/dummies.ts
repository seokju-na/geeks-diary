import * as path from 'path';
import { Dummy, TextDummy, TypesDummy } from '../../../test/helpers';
import { VcsFileChange, VcsFileChangeStatusTypes } from '../../core/vcs';


export class VcsFileChangeDummy implements Dummy<VcsFileChange> {
    private filePath = new TextDummy('file');
    private status = new TypesDummy<VcsFileChangeStatusTypes>([
        VcsFileChangeStatusTypes.REMOVED,
        VcsFileChangeStatusTypes.MODIFIED,
        VcsFileChangeStatusTypes.RENAMED,
        VcsFileChangeStatusTypes.NEW,
    ]);

    constructor(public readonly workspaceDir: string = '/test/workspace') {
    }

    create(status = this.status.create()): VcsFileChange {
        const filePath = this.filePath.create();
        let fileChange = {
            filePath,
            workingDirectoryPath: this.workspaceDir,
            absoluteFilePath: path.resolve(this.workspaceDir, filePath),
            status,
        } as VcsFileChange;

        if (status === VcsFileChangeStatusTypes.RENAMED) {
            fileChange = {
                ...fileChange,
                headToIndexDiff: {
                    oldFilePath: 'old-file',
                    newFilePath: filePath,
                },
            };
        }

        return fileChange;
    }
}
