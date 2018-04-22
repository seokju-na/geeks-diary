import {
    createDummyList,
    DatetimeDummyFactory,
    DummyFactory,
    StringIdDummyFactory,
    TextDummyFactory,
} from '../../testing/dummy';
import { NoteContent, NoteContentSnippet, NoteContentSnippetTypes, NoteSimple } from './models';


export class NoteSimpleDummyFactory implements DummyFactory<NoteSimple> {
    id = new StringIdDummyFactory(this.namespace);
    title = new TextDummyFactory('NoteTitle');
    createdDatetime = new DatetimeDummyFactory();
    updatedDatetime = new DatetimeDummyFactory();

    constructor(readonly namespace = 'note') {
    }

    create(): NoteSimple {
        return {
            id: this.id.create(),
            title: this.title.create(),
            stacks: [],
            createdDatetime: this.createdDatetime.create(),
            updatedDatetime: this.updatedDatetime.create(),
        };
    }
}


export class NoteContentSnippetDummyFactory implements DummyFactory<NoteContentSnippet> {
    id = new StringIdDummyFactory(this.namespace);
    value = new TextDummyFactory('some note content...');

    constructor(readonly namespace = 'noteContentSnippet') {
    }

    create(
        type: NoteContentSnippetTypes = NoteContentSnippetTypes.TEXT,
        language?: string,
        fileName?: string,
    ): NoteContentSnippet {

        const id = this.id.create();

        switch (type) {
            case NoteContentSnippetTypes.TEXT:
                return {
                    id,
                    type,
                    value: this.value.create(),
                };

            case NoteContentSnippetTypes.CODE:
                return {
                    id,
                    type,
                    value: this.value.create(),
                    language,
                    fileName,
                };
        }
    }
}


export class NoteContentDummyFactory implements DummyFactory<NoteContent> {
    id = new StringIdDummyFactory(this.namespace);

    constructor(readonly namespace = 'note') {
    }

    create(
        noteId: string = this.id.create(),
        snippets: NoteContentSnippet[] =
            createDummyList(new NoteContentSnippetDummyFactory(), 10),
    ): NoteContent {
        return {
            noteId,
            snippets,
        };
    }
}
