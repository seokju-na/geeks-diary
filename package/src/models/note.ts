import * as kebabCase from 'lodash.kebabcase';
import { datetime } from '../libs/datetime';
import { NoteSnippet } from './note-snippet';


/**
 * Interface for note.
 * 이 데이터는 워크스페이스에 저장됩니다.
 * 저장 경로는 다음과 같습니다.
 * e.g. /foo/bar/workspace/.geeks-diary/{uniqueId}.json
 */
export interface Note {
    /** Unique note id. Format follows UUID. */
    readonly id: string;
    readonly title: string;
    readonly snippets: NoteSnippet[];
    readonly stackIds: string[];

    /** Content file name. e.g. 18-07-21-Note-Title-1.md */
    readonly contentFileName: string;

    /** Content file path. e.g. /foo/bar/workspace/CATEGORY/18-07-21-Note-Title-1.md */
    readonly contentFilePath: string;

    readonly createdDatetime: number;
    readonly updatedDatetime: number;
}


/**
 * Note content file name automatically generated.
 *
 * e.g.
 * Note title : This is note
 * Note created datetime : 2018/07/09
 *
 * Note content file name will be '18-07-09-this-is-note.md'.
 * Format is 'YY-MM-DD-kebab-case-of-note-title.md'.
 *
 * @param {number} createdDatetime
 * @param {string} title
 * @returns {string}
 */
export function makeContentFileName(
    createdDatetime: number,
    title: string,
): string {

    return `${datetime.shortFormat(new Date(createdDatetime))}-${kebabCase(title)}`;
}
