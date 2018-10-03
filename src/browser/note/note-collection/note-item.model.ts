import * as path from 'path';
import { Note } from '../../../core/note';


export interface NoteItem extends Note {
    readonly label?: string;

    /**
     * Note file name.
     * e.g. {some-unique-id}.json
     */
    readonly fileName: string;

    /**
     * Note file path.
     * e.g. /foo/bar/workspace/.geeks-diary/notes/{some-unique-id}.json
     */
    readonly filePath: string;
}


export function getNoteLabel(
    note: Note,
    basePath: string,
): string | null {

    const relative = path.relative(basePath, note.contentFilePath);

    if (relative !== note.contentFileName) {
        return relative.replace(`/${note.contentFileName}`, '');
    } else {
        return null;
    }
}
