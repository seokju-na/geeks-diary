import { Note } from '../../models/note';
import { NoteSnippet, NoteSnippetTypes } from '../../models/note-snippet';
import { NoteDummy } from './dummies';
import { NoteSnippetContent } from './shared/note-content.model';


const noteDummy = new NoteDummy();


interface NoteFixture {
    note?: Note;
    snippetContents?: NoteSnippetContent[];
    contentRawValue?: string;
}


export function basicFixture(): NoteFixture {
    const contentRawValue =
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
        'Cool~\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 1,
        endLineNumber: 3,
    };
    const snippet1Value =
        '# Title\n' +
        'Second Line\n' +
        'Third Line';

    const snippet2: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 5,
        endLineNumber: 9,
        codeLanguageId: 'rust',
        codeFileName: '',
    };
    const snippet2Value =
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```';

    const snippet3: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 11,
        endLineNumber: 11,
    };
    const snippet3Value = 'Cool~';

    return {
        note: {
            ...noteDummy.create(),
            title: 'Title',
            snippets: [snippet1, snippet2, snippet3],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
            { ...snippet2, value: snippet2Value },
            { ...snippet3, value: snippet3Value },
        ],
        contentRawValue,
    };
}


export function textSnippetsOnlyFixture(): NoteFixture {
    const contentRawValue =
        '# Title\n' +
        'Lorem ipsum\n' +
        'coffee\n' +
        '\n' +
        'kimchi\n' +
        'hungry\n' +
        '\n' +
        '## seoul\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 1,
        endLineNumber: 8,
    };
    const snippet1Value =
        '# Title\n' +
        'Lorem ipsum\n' +
        'coffee\n' +
        '\n' +
        'kimchi\n' +
        'hungry\n' +
        '\n' +
        '## seoul';

    return {
        note: {
            ...noteDummy.create(),
            snippets: [snippet1],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
        ],
        contentRawValue,
    };
}


export function codeSnippetsOnlyFixture(): NoteFixture {
    const contentRawValue =
        '\n' +
        '```typescript\n' +
        'function helloWorld(): void {\n' +
        '    console.log(\'ho!\');\n' +
        '}\n' +
        '```\n' +
        '\n' +
        '```\n' +
        'this_is_code\n' +
        'maybe\n' +
        '```\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 2,
        endLineNumber: 6,
        codeLanguageId: 'typescript',
        codeFileName: '',
    };
    const snippet1Value =
        '```typescript\n' +
        'function helloWorld(): void {\n' +
        '    console.log(\'ho!\');\n' +
        '}\n' +
        '```';

    const snippet2: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 8,
        endLineNumber: 11,
        codeLanguageId: '',
        codeFileName: '',
    };
    const snippet2Value =
        '```\n' +
        'this_is_code\n' +
        'maybe\n' +
        '```';

    return {
        note: {
            ...noteDummy.create(),
            snippets: [snippet1, snippet2],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
            { ...snippet2, value: snippet2Value },
        ],
        contentRawValue,
    };
}


export function frontMatterFixture(): NoteFixture {
    const contentRawValue =
        '---\n' +
        'title: Real Title\n' +
        'stacks:\n' +
        '  - javascript\n' +
        '  - typescript\n' +
        'date: Sat Jul 14 2018 16:32:00 GMT+0900\n' +
        '---\n' +
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
        'Cool~\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 8,
        endLineNumber: 10,
    };
    const snippet1Value =
        '# Title\n' +
        'Second Line\n' +
        'Third Line';

    const snippet2: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 12,
        endLineNumber: 16,
        codeLanguageId: 'rust',
        codeFileName: '',
    };
    const snippet2Value =
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```';

    const snippet3: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 18,
        endLineNumber: 18,
    };
    const snippet3Value = 'Cool~';

    return {
        note: {
            ...noteDummy.create(),
            title: 'Real Title',
            createdDatetime: 1531553520000,
            stackIds: ['javascript', 'typescript'],
            snippets: [snippet1, snippet2, snippet3],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
            { ...snippet2, value: snippet2Value },
            { ...snippet3, value: snippet3Value },
        ],
        contentRawValue,
    };
}


export function frontMatterNoTitleFixture(): NoteFixture {
    const contentRawValue =
        '---\n' +
        'stacks:\n' +
        '  - javascript\n' +
        '  - typescript\n' +
        'date: Sat Jul 14 2018 16:32:00 GMT+0900\n' +
        '---\n' +
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
        'Cool~\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 7,
        endLineNumber: 9,
    };
    const snippet1Value =
        '# Title\n' +
        'Second Line\n' +
        'Third Line';

    const snippet2: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 11,
        endLineNumber: 15,
        codeLanguageId: 'rust',
        codeFileName: '',
    };
    const snippet2Value =
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```';

    const snippet3: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 17,
        endLineNumber: 17,
    };
    const snippet3Value = 'Cool~';

    return {
        note: {
            ...noteDummy.create(),
            title: 'Title',
            createdDatetime: 1531553520000,
            stackIds: ['javascript', 'typescript'],
            snippets: [snippet1, snippet2, snippet3],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
            { ...snippet2, value: snippet2Value },
            { ...snippet3, value: snippet3Value },
        ],
        contentRawValue,
    };
}


export function frontMatterInvalidDateFixture(): NoteFixture {
    const contentRawValue =
        '---\n' +
        'date: Invalid Date\n' +
        '---\n' +
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
        'Cool~\n';

    const snippet1: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 4,
        endLineNumber: 6,
    };
    const snippet1Value =
        '# Title\n' +
        'Second Line\n' +
        'Third Line';

    const snippet2: NoteSnippet = {
        type: NoteSnippetTypes.CODE,
        startLineNumber: 8,
        endLineNumber: 12,
        codeLanguageId: 'rust',
        codeFileName: '',
    };
    const snippet2Value =
        '```rust\n' +
        'fn main() {\n' +
        '    println!("Hello World!");\n' +
        '}\n' +
        '```';

    const snippet3: NoteSnippet = {
        type: NoteSnippetTypes.TEXT,
        startLineNumber: 14,
        endLineNumber: 14,
    };
    const snippet3Value = 'Cool~';

    return {
        note: {
            ...noteDummy.create(),
            title: 'Title',
            snippets: [snippet1, snippet2, snippet3],
        },
        snippetContents: [
            { ...snippet1, value: snippet1Value },
            { ...snippet2, value: snippet2Value },
            { ...snippet3, value: snippet3Value },
        ],
        contentRawValue,
    };
}
