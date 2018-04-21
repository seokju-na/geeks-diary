import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { NoteEditorComponent } from './editor.component';
import { NoteEditorService } from './editor.service';
import { NoteCodeEditorSnippetComponent } from './snippets/code-snippet.component';
import { NoteEditorSnippetFactory } from './snippets/snippet-factory';
import { NoteTextEditorSnippetComponent } from './snippets/text-snippet.component';


@NgModule({
    imports: [
        SharedModule,
    ],
    providers: [
        NoteEditorSnippetFactory,
        NoteEditorService,
    ],
    entryComponents: [
        NoteCodeEditorSnippetComponent,
        NoteTextEditorSnippetComponent,
    ],
    declarations: [
        NoteEditorComponent,
        NoteCodeEditorSnippetComponent,
        NoteTextEditorSnippetComponent,
    ],
    exports: [
        NoteEditorComponent,
    ],
})
export class NoteEditorModule {
}
