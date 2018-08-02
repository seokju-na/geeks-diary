import { EventEmitter } from '@angular/core';
import * as path from 'path';
import {
    createDummies,
    DatetimeDummy,
    Dummy,
    StringIdDummy,
    TextDummy,
    TypesDummy,
} from '../../../test/helpers/dummies';
import { datetime, DateUnits } from '../../libs/datetime';
import { SortDirection } from '../../libs/sorting';
import { getNoteLabel, makeContentFileName, Note } from '../../models/note';
import { NoteSnippetTypes } from '../../models/note-snippet';
import { NoteSnippetEditor } from './note-snippet-editors/note-snippet-editor';
import { NoteSnippetEditorConfig } from './note-snippet-editors/note-snippet-editor-config';
import { NoteSnippetEditorEvent } from './note-snippet-editors/note-snippet-editor-events';
import { NoteCollectionFilterBy, NoteCollectionSortBy } from './shared/note-collection.state';
import { NoteContent, NoteSnippetContent } from './shared/note-content.model';
import { NoteItem } from './shared/note-item.model';


const _id = new StringIdDummy('NoteId');
const _title = new TextDummy('NoteTitle');
const _createdDatetime = new DatetimeDummy();
const _updatedDatetime = new DatetimeDummy();
const _fileName = new TextDummy('note-file');


export class NoteDummy extends Dummy<Note> {
    private id = new StringIdDummy('NoteId');
    private title = new TextDummy('NoteTitle');
    private createdDatetime = new DatetimeDummy();
    private updatedDatetime = new DatetimeDummy();

    constructor(
        private readonly workspacePath = '/test-workspace/',
    ) {
        super();
    }

    create(): Note {
        const title = this.title.create();
        const createdDatetime = this.createdDatetime.create();
        const contentFileName = makeContentFileName(createdDatetime, title);

        return {
            id: this.id.create(),
            title,
            snippets: [],
            stackIds: [],
            contentFileName,
            contentFilePath: path.resolve(this.workspacePath, contentFileName),
            createdDatetime,
            updatedDatetime: this.updatedDatetime.create(),
        };
    }
}


export class NoteItemDummy extends Dummy<NoteItem> {
    constructor(
        private readonly workspacePath = '/test-workspace/',
        private readonly notesPath = '/test-workspace/.geeks-diary/notes/',
    ) {
        super();
    }

    create(): NoteItem {
        const title = _title.create();
        const createdDatetime = _createdDatetime.create();
        const contentFileName = makeContentFileName(createdDatetime, title);
        const fileName = _fileName.create();

        return {
            id: _id.create(),
            title,
            stackIds: [],
            contentFileName,
            contentFilePath: path.resolve(this.workspacePath, contentFileName),
            createdDatetime,
            updatedDatetime: _updatedDatetime.create(),
            fileName: `${fileName}.json`,
            filePath: path.resolve(this.notesPath, `${fileName}.json`),
        };
    }

    createFromNote(note: Note): NoteItem {
        const label = getNoteLabel(note, this.workspacePath);
        const fileName = _fileName.create();

        const item: NoteItem = {
            id: note.id,
            title: note.title,
            stackIds: note.stackIds,
            createdDatetime: note.createdDatetime,
            updatedDatetime: note.updatedDatetime,
            contentFileName: note.contentFileName,
            contentFilePath: note.contentFilePath,
            fileName: `${fileName}.json`,
            filePath: path.resolve(this.notesPath, `${fileName}.json`),
        };

        if (label) {
            return { ...item, label };
        } else {
            return item;
        }
    }
}


/**
 * @example
 * // Original notes: [0, 1, 2, 3, 4]
 * // Expected notes: [1, 2, 4]
 *
 * prepareForFilteringNotes(
 *     notes,
 *     ['x', 'o', 'o', 'x', 'o'],
 *     ...others
 * );
 */
export function prepareForFilteringNotes(
    notes: NoteItem[],
    states: ('o' | 'x')[],
    filtering: {
        by: NoteCollectionFilterBy,
        value: any,
    },
): void {

    const included = datetime.copy(filtering.value as Date);
    const excluded = datetime.copy(filtering.value as Date);

    if (filtering.by === NoteCollectionFilterBy.BY_MONTH) {
        datetime.resetDate(included, DateUnits.MONTH);
        datetime.add(excluded, DateUnits.MONTH, -1);
    } else if (filtering.by === NoteCollectionFilterBy.BY_DATE) {
        datetime.resetDate(included, DateUnits.DAY);
        datetime.add(excluded, DateUnits.DAY, -1);
    }

    for (let i = 0; i < states.length; i++) {
        const note = notes[i];
        const state = states[i];

        if (state === 'o') {
            (<any>note).createdDatetime = included.getTime();
        } else if (state === 'x') {
            (<any>note).createdDatetime = excluded.getTime();
        }
    }
}


/**
 * @example
 * // Original notes: [0, 1, 2, 3, 4]
 * // Expected notes: [3, 4, 1, 2]
 *
 * prepareForSortingNotes(
 *     notes,
 *     ['x', 3, 4, 1, 2],
 *     ...others
 * );
 */
export function prepareForSortingNotes(
    notes: NoteItem[],
    states: ('x' | number)[],
    sorting: {
        by: NoteCollectionSortBy,
        direction: SortDirection,
    },
): void {

    const maxOrder = states.reduce((max, value) => {
        if (value === 'x') {
            return max;
        }

        if (max < value) {
            return value;
        } else {
            return max;
        }
    }, 1) as number;

    let order: number;
    let index: number;
    let increasing = 1;

    if (sorting.direction === SortDirection.ASC) {
        order = 1;
    } else if (sorting.direction === SortDirection.DESC) {
        order = maxOrder;
    }

    // Reset created datetime and updated datetime.
    notes.forEach((note) => {
        const createdDatetime = new Date(note.createdDatetime);
        const updatedDatetime = new Date(note.updatedDatetime);

        datetime.resetDate(createdDatetime, DateUnits.DAY);
        datetime.resetDate(updatedDatetime, DateUnits.DAY);

        (<any>note).createdDatetime = createdDatetime.getTime();
        (<any>note).updatedDatetime = createdDatetime.getTime();
    });

    do {
        index = states.findIndex(value => value === order);

        const note = notes[index];

        // 오름차순으로 prop 설정.
        switch (sorting.by) {
            case NoteCollectionSortBy.CREATED:
                const createdDatetime = new Date(note.createdDatetime);
                datetime.add(createdDatetime, DateUnits.HOUR, increasing);

                (<any>note).createdDatetime = createdDatetime.getTime();
                break;

            case NoteCollectionSortBy.UPDATED:
                const updatedDatetime = new Date(note.updatedDatetime);
                datetime.add(updatedDatetime, DateUnits.HOUR, increasing);

                (<any>note).updatedDatetime = updatedDatetime.getTime();
                break;

            case NoteCollectionSortBy.TITLE:
                (<any>note).title = `Title${increasing}`;
                break;
        }

        if (sorting.direction === SortDirection.ASC) {
            order++;
        } else if (sorting.direction === SortDirection.DESC) {
            order--;
        }

        increasing++;
    } while (index !== -1 && order > 0 && order <= maxOrder);
}


export class NoteSnippetContentDummy extends Dummy<NoteSnippetContent> {
    private type = new TypesDummy<NoteSnippetTypes>([
        NoteSnippetTypes.TEXT,
        NoteSnippetTypes.CODE,
    ]);
    private value = new TextDummy('SnippetValue');
    private codeLanguageId = new TextDummy('CodeLanguage');
    private codeFileName = new TextDummy('CodeFileName');

    create(type: NoteSnippetTypes = this.type.create()): NoteSnippetContent {
        const result: NoteSnippetContent = {
            type,
            value: this.value.create(),
        };

        if (type === NoteSnippetTypes.CODE) {
            return {
                ...result,
                codeLanguageId: this.codeLanguageId.create(),
                codeFileName: this.codeFileName.create(),
            };
        } else {
            return result;
        }
    }
}


export class NoteContentDummy extends Dummy<NoteContent> {
    private snippet = new NoteSnippetContentDummy();

    create(snippetCount: number = 5): NoteContent {
        return {
            snippets: createDummies(this.snippet, snippetCount),
        };
    }
}


export class NoteSnippetEditorDummy extends Dummy<NoteSnippetEditor> {
    private content = new NoteSnippetContentDummy();

    create(): NoteSnippetEditor {
        return {
            _editor: null,
            content: this.content.create(),
            config: new NoteSnippetEditorConfig(),
            events: new EventEmitter<NoteSnippetEditorEvent>(),
            initialize() {},
            focus: jasmine.createSpy('focus spy'),
            blur: jasmine.createSpy('blur spy'),
            getRawValue: jasmine.createSpy('get raw value spy'),
            setRawValue: jasmine.createSpy('set raw value spy'),
            isCurrentPositionTop: jasmine.createSpy('is current position top spy'),
            isCurrentPositionBottom: jasmine.createSpy('is current position bottom spy'),
            setPositionToTop: jasmine.createSpy('set position to top spy'),
            setPositionToBottom: jasmine.createSpy('set position to bottom spy'),
        } as any;
    }
}
