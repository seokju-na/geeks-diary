import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { StackModule } from '../stack/stack.module';
import { NoteCalendarComponent } from './calendar/calendar.component';
import { NoteEditorComponent } from './editor/editor.component';
import { NoteEditorService } from './editor/editor.service';
import { NoteEditorCodeSnippetComponent } from './editor/snippet/code-snippet.component';
import { NoteEditorSnippetFactory } from './editor/snippet/snippet-factory';
import { NoteEditorTextSnippetComponent } from './editor/snippet/text-snippet.component';
import { NoteEditorEffects, NoteFsEffects } from './effects';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteHeaderComponent } from './header/header.component';
import { NoteItemComponent } from './item/item.component';
import { NoteFsService } from './note-fs.service';
import { noteReducerMap } from './reducers';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
        StoreModule.forFeature('note', noteReducerMap),
        EffectsModule.forFeature([
            NoteFsEffects,
            NoteEditorEffects,
        ]),
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteHeaderComponent,
        NoteEditorCodeSnippetComponent,
        NoteEditorTextSnippetComponent,
        NoteEditorComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
        NoteEditorCodeSnippetComponent,
        NoteEditorTextSnippetComponent,
    ],
    providers: [
        NoteFsService,
        NoteEditorSnippetFactory,
        NoteEditorService,
    ],
    exports: [
        NoteFinderComponent,
        NoteHeaderComponent,
        NoteEditorComponent,
    ],
})
export class NoteModule {
}
