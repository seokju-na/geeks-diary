import { StatusFile } from 'nodegit';
import { GitStatus } from '../../core/git.models';


export class VcsFileStatus {
    fileName: string;
    isDeleted: boolean;
    isIgnored: boolean;
    isModified: boolean;
    isNew: boolean;
    isRenamed: boolean;
    status: GitStatus;

    static createFromStatusFile(status: StatusFile): VcsFileStatus {
        return {
            fileName: status.path(),
            isDeleted: status.isDeleted(),
            isIgnored: status.isIgnored(),
            isModified: status.isModified(),
            isNew: status.isNew(),
            isRenamed: status.isRenamed(),
            status: status.statusBit(),
        };
    }
}
