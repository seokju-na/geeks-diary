import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { StackModule } from '../../stack';
import { UiModule } from '../../ui/ui.module';
import { NoteCodeSnippetActionDialog } from './note-code-snippet-action-dialog/note-code-snippet-action-dialog';
import { NoteCodeSnippetEditorComponent } from './note-code-snippet-editor/note-code-snippet-editor.component';
import { NoteEditorComponent } from './note-editor.component';
import { NoteEditorService } from './note-editor.service';
import { NoteSnippetListManager } from './note-snippet-list-manager';
import { NoteTextSnippetEditorComponent } from './note-text-snippet-editor/note-text-snippet-editor.component';
import { NoteEditorToolbarComponent } from './note-editor-toolbar/note-editor-toolbar.component';
import { NoteHeaderComponent } from './note-header/note-header.component';


@NgModule({
    imports: [
        UiModule,
        StackModule,
    ],
    declarations: [
        NoteEditorComponent,
        NoteTextSnippetEditorComponent,
        NoteCodeSnippetEditorComponent,
        NoteEditorToolbarComponent,
        NoteHeaderComponent,
    ],
    entryComponents: [
        NoteTextSnippetEditorComponent,
        NoteCodeSnippetEditorComponent,
    ],
    providers: [
        DatePipe,
        NoteEditorService,
        NoteSnippetListManager,
        NoteCodeSnippetActionDialog,
    ],
    exports: [
        NoteEditorComponent,
        NoteHeaderComponent,
    ],
})
export class NoteEditorModule {
}
