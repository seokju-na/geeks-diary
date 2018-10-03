import { Note, NoteSnippetTypes } from '../../core/note';
import { NoteItem } from './note-collection';
import { NoteContent } from './note-editor';


export const basicFixture = {
    contentRawValue:
        '# Title\n' +
        'Second Line\n' +
        'Third Line\n' +
        '\n' +
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```\n' +
        '\n' +
        'Cool~\n',
    title: 'Title',
    stackIds: [],
    note: {
        id: 'basic-note',
        title: 'Title',
        snippets: [
            {
                type: NoteSnippetTypes.TEXT,
                startLineNumber: 1,
                endLineNumber: 3,
            },
            {
                type: NoteSnippetTypes.CODE,
                startLineNumber: 5,
                endLineNumber: 9,
                codeLanguageId: 'rust',
                codeFileName: '',
            },
            {
                type: NoteSnippetTypes.TEXT,
                startLineNumber: 11,
                endLineNumber: 11,
            },
        ],
        stackIds: [],
        contentFileName: '18-10-02-Title.md',
        contentFilePath: '/foo/bar/workspace/label/18-10-02-Title.md',
        createdDatetime: 1538493619943,
        updatedDatetime: 1538493619943,
    } as Note,
    noteItem: {
        id: 'basic-note',
        title: 'Title',
        snippets: [
            {
                type: NoteSnippetTypes.TEXT,
                startLineNumber: 1,
                endLineNumber: 3,
            },
            {
                type: NoteSnippetTypes.CODE,
                startLineNumber: 5,
                endLineNumber: 9,
                codeLanguageId: 'rust',
                codeFileName: '',
            },
            {
                type: NoteSnippetTypes.TEXT,
                startLineNumber: 11,
                endLineNumber: 11,
            },
        ],
        stackIds: [],
        contentFileName: '18-10-02-Title.md',
        contentFilePath: '/foo/bar/workspace/label/18-10-02-Title.md',
        createdDatetime: 1538493619943,
        updatedDatetime: 1538493619943,
        fileName: 'basic-note.json',
        filePath: '/foo/bar/workspace/.geeks-diary/notes/basic-note.json',
        label: 'label',
    } as NoteItem,
    content: {
        noteId: 'basic-note',
        snippets: [
            {
                type: NoteSnippetTypes.TEXT,
                value: '# Title\n' +
                    'Second Line\n' +
                    'Third Line',
            },
            {
                type: NoteSnippetTypes.CODE,
                codeLanguageId: 'rust',
                codeFileName: '',
                value: '```rust\n' +
                    'fn main() {\n' +
                    '    println!("Hello World!");\n' +
                    '}\n' +
                    '```',
            },
            {
                type: NoteSnippetTypes.TEXT,
                value: 'Cool~',
            },
        ],
    } as NoteContent,
    dateStr: 'Wed, 3 Oct 2018 00:34:00 +0900',
    lineSpacing: 2,
    contentParsedValue:
        '---\n' +
        'title: Title\n' +
        'date: \'Wed, 3 Oct 2018 00:34:00 +0900\'\n' +
        'stacks: []\n' +
        '---\n' +
        '\n' +
        '# Title\n' +
        'Second Line\n' +
        'Third Line\n' +
        '\n\n' +
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```\n' +
        '\n\n' +
        'Cool~\n\n\n',
};
