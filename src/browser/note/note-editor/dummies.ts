import { createDummies, Dummy, StringIdDummy, TextDummy, TypesDummy } from '../../../../test/helpers';
import { Note, NoteSnippetTypes } from '../../../core/note';
import { NoteContent, NoteSnippetContent } from './note-content.model';


const _noteId = new StringIdDummy('NoteId');


export class NoteSnippetContentDummy extends Dummy<NoteSnippetContent> {
    private type = new TypesDummy<NoteSnippetTypes>([
        NoteSnippetTypes.TEXT,
        NoteSnippetTypes.CODE,
    ]);
    private value = new TextDummy('SnippetValue');
    private codeLanguageId = new TextDummy('CodeLanguage');
    private codeFileName = new TextDummy('CodeFileName');

    create(type: NoteSnippetTypes = this.type.create()): NoteSnippetContent {
        const dummy: NoteSnippetContent = {
            type,
            value: this.value.create(),
        };

        if (type === NoteSnippetTypes.CODE) {
            return {
                ...dummy,
                codeLanguageId: this.codeLanguageId.create(),
                codeFileName: this.codeFileName.create(),
            };
        } else {
            return dummy;
        }
    }
}


export class NoteContentDummy extends Dummy<NoteContent> {
    private snippet = new NoteSnippetContentDummy();

    create(snippetCount: number = 5): NoteContent {
        return {
            noteId: _noteId.create(),
            snippets: createDummies(this.snippet, snippetCount),
        };
    }

    createFromNote(note: Note): NoteContent {
        return {
            noteId: note.id,
            snippets: [],
        };
    }
}
