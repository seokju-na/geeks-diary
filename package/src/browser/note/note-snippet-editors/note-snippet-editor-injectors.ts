import { InjectionToken } from '@angular/core';
import { NoteSnippetEditorRef } from './note-snippet-editor-ref';


export const NOTE_SNIPPET_EDITOR_REF =
    new InjectionToken<NoteSnippetEditorRef<any>>('NoteSnippetEditorRef');
