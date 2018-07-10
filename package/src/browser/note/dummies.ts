import * as path from 'path';
import { DatetimeDummy, Dummy, StringIdDummy, TextDummy } from '../../../test/helpers/dummies';
import { makeContentFileName } from '../../models/note';
import { NoteItem } from './shared/note-item.model';


export class NoteItemDummy extends Dummy<NoteItem> {
    private id = new StringIdDummy('NoteId');
    private title = new TextDummy('NoteTitle');
    private createdDatetime = new DatetimeDummy();
    private updatedDatetime = new DatetimeDummy();

    constructor(private readonly workspacePath = '/test-workspace/') {
        super();
    }

    create(): NoteItem {
        const title = this.title.create();
        const createdDatetime = this.createdDatetime.create();
        const contentFileName = `${makeContentFileName(createdDatetime, title)}.md`;

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
