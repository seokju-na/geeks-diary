import {
    createDummyList,
    DatetimeDummyFactory,
    DummyFactory,
    StringIdDummyFactory,
    TextDummyFactory,
    TypesDummyFactory,
} from '../../testing/dummy';
import { NoteContent, NoteContentSnippet, NoteContentSnippetTypes, NoteMetadata } from './models';


export class NoteMetadataDummyFactory implements DummyFactory<NoteMetadata> {
    id: StringIdDummyFactory;
    title = new TextDummyFactory('NoteTitle');
    createdDatetime = new DatetimeDummyFactory();
    updatedDatetime = new DatetimeDummyFactory();

    constructor(readonly namespace = 'note') {
        this.id = new StringIdDummyFactory(this.namespace);
    }

    create(): NoteMetadata {
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
    id: StringIdDummyFactory;
    type = new TypesDummyFactory<NoteContentSnippetTypes>(
        [NoteContentSnippetTypes.CODE, NoteContentSnippetTypes.TEXT],
    );
    value = new TextDummyFactory('some note content...');

    constructor(readonly namespace = 'noteContentSnippet') {
        this.id = new StringIdDummyFactory(this.namespace);
    }

    create(
        type: NoteContentSnippetTypes = this.type.create(),
        language = 'typescript',
        fileName = 'test-file.ts',
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
    id: StringIdDummyFactory;

    constructor(readonly namespace = 'note') {
        this.id = new StringIdDummyFactory(this.namespace);
    }

    create(
        noteId: string = this.id.create(),
        snippets: NoteContentSnippet[] =
            createDummyList(new NoteContentSnippetDummyFactory(), 3),
    ): NoteContent {
        return {
            noteId,
            snippets,
        };
    }
}
