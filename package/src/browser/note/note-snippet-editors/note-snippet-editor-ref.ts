import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { NoteSnippetEditor } from './note-snippet-editor';


let uniqueId = 0;


export class NoteSnippetEditorRef<T extends NoteSnippetEditor> {
    instance: T;
    outlet: DomPortalOutlet;

    constructor(
        private portal: ComponentPortal<T>,
        public readonly id = `gd-note-snippet-editor-${uniqueId++}`,
    ) {
    }
}
