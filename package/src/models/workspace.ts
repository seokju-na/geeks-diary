import * as path from 'path';
import { environment } from '../environments/environment';


export const WORKSPACE_DIR_PATH = path.resolve(environment.getPath('userData'), 'workspace/');

export const GEEKS_DIARY_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/');
export const ASSETS_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/assets/');
export const NOTES_DIR_PATH = path.resolve(WORKSPACE_DIR_PATH, '.geeks-diary/notes/');


export interface WorkspaceInfo {
    readonly id?: number;
    readonly theme: string;
}
