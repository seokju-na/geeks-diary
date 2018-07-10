import { IpcHubClient } from '../../libs/ipc';
import { Workspace } from '../../models/workspace';


/**
 * Load workspace data from main process.
 * To use this function, make sure workspace has been initialized.
 * @returns {Promise<void>}
 */
export async function afterWorkspaceInit(): Promise<void> {
    const client = new IpcHubClient('workspace');
    const workspace = await client.request<void, any>('getWorkspace');

    if (workspace) {
        (<any>window).WORKSPACE = workspace;
        (<any>window).WORKSPACE_INITIALIZED = true;
    } else {
        (<any>window).WORKSPACE = null;
        (<any>window).WORKSPACE_INITIALIZED = false;
    }

    return;
}


export function getWorkspace(): Workspace | undefined {
    return (<any>window).WORKSPACE;
}
