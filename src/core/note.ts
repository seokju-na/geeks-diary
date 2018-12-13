import * as kebabCase from 'lodash.kebabcase';
import { datetime } from '../libs/datetime';


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
}


export enum NoteSnippetTypes {
    TEXT = 'TEXT',
    CODE = 'CODE',
}


export interface NoteSnippet {
    readonly type: NoteSnippetTypes;

    /** Line number where snippet starts. */
    readonly startLineNumber: number;

    /** Line number where snippet ends. */
    readonly endLineNumber: number;

    /** Language id which code snippet contains. */
    readonly codeLanguageId?: string;

    /** File name which code snippet contains. */
    readonly codeFileName?: string;
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
export function makeNoteContentFileName(
    createdDatetime: number,
    title: string,
): string {

    return `${datetime.shortFormat(new Date(createdDatetime))}-${kebabCase(title)}.md`;
}


/**
 * Front matter data which stored in note content file.
 * Formatted with yaml.
 *
 * Use generic properties to integrate with other services.
 * (e.g. Jekyll)
 */
export interface NoteMetadata {
    readonly title?: string;
    readonly date?: string;
    readonly stacks?: string[];
}
