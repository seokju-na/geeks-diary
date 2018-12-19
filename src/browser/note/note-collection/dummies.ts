import * as path from 'path';
import { DatetimeDummy, Dummy, StringIdDummy, TextDummy } from '../../../../test/helpers';
import { makeNoteContentFileName, Note } from '../../../core/note';
import { SortDirection } from '../../../core/sorting';
import { datetime, DateUnits } from '../../../libs/datetime';
import { NoteCollectionFilterBy, NoteCollectionSortBy } from './note-collection.state';
import { NoteItem } from './note-item.model';


const _id = new StringIdDummy('NoteId');
const _title = new TextDummy('NoteTitle');
const _createdDatetime = new DatetimeDummy();
const _fileName = new TextDummy('note-file');


export class NoteDummy extends Dummy<Note> {
    private id = new StringIdDummy('NoteId');
    private title = new TextDummy('NoteTitle');
    private createdDatetime = new DatetimeDummy();

    create(label: string = ''): Note {
        const title = this.title.create();
        const createdDatetime = this.createdDatetime.create();
        const contentFileName = makeNoteContentFileName(createdDatetime, title);

        return {
            id: this.id.create(),
            title,
            label,
            snippets: [],
            stackIds: [],
            contentFileName,
            createdDatetime,
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
        const contentFileName = makeNoteContentFileName(createdDatetime, title);
        const fileName = _fileName.create();

        return {
            id: _id.create(),
            title,
            snippets: [],
            stackIds: [],
            contentFileName,
            contentFilePath: path.resolve(this.workspacePath, contentFileName),
            createdDatetime,
            fileName: `${fileName}.json`,
            filePath: path.resolve(this.notesPath, `${fileName}.json`),
        };
    }

    createFromNote(note: Note): NoteItem {
        const fileName = _fileName.create();

        return {
            ...note,
            fileName: `${fileName}.json`,
            filePath: path.resolve(this.notesPath, `${fileName}.json`),
            contentFilePath: path.resolve(this.workspacePath, note.label, note.contentFileName),
        };
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
        datetime.resetDate(createdDatetime, DateUnits.DAY);

        (<any>note).createdDatetime = createdDatetime.getTime();
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
