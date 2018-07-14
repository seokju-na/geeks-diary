import * as path from 'path';
import { environment } from '../environments/environment';


/**
 * Workspace directory structure.
 *
 * @code
 * .
 * ├── .geeks-diary/             - Geeks diary workspace configurations.
 * |   ├── notes/                - Notes directory.
 * |   |   ├── {noteId}.json     - Note file.
 * |   |   └── ...other notes
 * |   ├── assets/               - Assets imported in note.
 * |   └── workspace.json        - Workspace configuration file.
 * └── ...other files
 */


export const WORKSPACE_DIR_PATH = path.resolve(environment.getPath('userData'), 'workspace/');

export const GEEKS_DIARY_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/');
export const ASSETS_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/assets/');
export const NOTES_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/notes/');


export interface WorkspaceInfo {
    readonly id?: number;
    readonly theme: string;
}


export enum WorkspaceErrorCodes {
    WORKSPACE_ALREADY_EXISTS,
}


export class WorkspaceError extends Error {
    constructor(public code: WorkspaceErrorCodes) {
        super(getDescriptionForError(code));
    }
}


function getDescriptionForError(code: WorkspaceErrorCodes): string {
    switch (code) {
        case WorkspaceErrorCodes.WORKSPACE_ALREADY_EXISTS:
            return 'Workspace already exists and is not an empty directory.';
        default:
            return 'Unknown Error';
    }
}
