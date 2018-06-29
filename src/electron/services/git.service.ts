import * as nodeGit from 'nodegit';
import { CloneOptions } from 'nodegit';
import { IpcChannelActionHandler, IpcChannelServer } from '../../common/ipc-channel';


export interface GitCloneOptions {
    remoteUrl: string;
    dirPath: string;
}


export enum GitErrorCodes {
    AUTHENTICATION_FAIL = 'AUTHENTICATION_FAIL',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
}


const errorCodeMap = {
    [GitErrorCodes.AUTHENTICATION_FAIL]: /authentication/g,
    [GitErrorCodes.CONNECTION_ERROR]: /(curl error|Connection|404)/g,
};


export class GitService {
    private readonly ipc = new IpcChannelServer('git');

    init(): void {
        const cloneHandler: IpcChannelActionHandler<GitCloneOptions, void> =
            this.clone.bind(this);

        this.ipc.registerActionHandler('clone', cloneHandler);
        this.ipc.setErrorHandler(this.handleError.bind(this));
    }

    destroy(): void {
        this.ipc.destroy();
    }

    async clone(data: GitCloneOptions): Promise<void> {
        const cloneOptions: CloneOptions = {
            fetchOpts: {
                callbacks: {
                    // GitHub certificate issue in OS X.
                    // Unfortunately in OS X there is a problem where libgit2 is unable to look up
                    // GitHub certificates correctly. In order to bypass this problem, we're going
                    // to passthrough the certificate check.
                    certificateCheck() {
                        return 1;
                    },
                },
            },
        };

        await nodeGit.Clone.clone(data.remoteUrl, data.dirPath, cloneOptions);
    }

    handleError(error: any): any {
        if (!error.message) {
            return error;
        }

        const codes = Object.keys(GitErrorCodes);
        let errorCode = null;

        for (const code of codes) {
            if (errorCodeMap[code].test(error.message)) {
                errorCode = code;
                break;
            }
        }

        return { ...error, code: errorCode };
    }
}
