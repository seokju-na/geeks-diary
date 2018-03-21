import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StackModule } from '../stack/stack.module';
import { NoteCalendarComponent } from './calendar/calendar.component';
import { NoteEditorComponent } from './editor/editor.component';
import { NoteEditorService } from './editor/editor.service';
import { NoteCodeEditorSnippetComponent } from './editor/snippets/code-snippet.component';
import { NoteEditorSnippetFactory } from './editor/snippets/snippet-factory';
import { NoteTextEditorSnippetComponent } from './editor/snippets/text-snippet.component';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteHeaderComponent } from './header/header.component';
import { NoteItemComponent } from './item/item.component';
import { NotePreviewComponent } from './preview/preview.component';
import { NoteWorkspaceComponent } from './workspace/workspace.component';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteWorkspaceComponent,
        NoteHeaderComponent,
        NotePreviewComponent,
        NoteEditorComponent,
        NoteCodeEditorSnippetComponent,
        NoteTextEditorSnippetComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
        NoteCodeEditorSnippetComponent,
        NoteTextEditorSnippetComponent,
    ],
    providers: [
        NoteEditorSnippetFactory,
        NoteEditorService,
    ],
    exports: [
        NoteFinderComponent,
        NoteWorkspaceComponent,
    ],
})
export class NoteModule {
}
