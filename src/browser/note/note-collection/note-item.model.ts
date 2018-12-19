import { Note } from '../../../core/note';


export interface NoteItem extends Note {
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

    /** Content file path. e.g. /foo/bar/workspace/CATEGORY/18-07-21-Note-Title-1.md */
    readonly contentFilePath: string;
}
