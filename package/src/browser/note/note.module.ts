import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UIModule } from '../ui/ui.module';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NoteFinderComponent } from './note-finder/note-finder.component';
import { NoteCalendarComponent } from './note-calendar/note-calendar.component';
import { NoteCollectionService } from './shared/note-collection.service';
import { NoteContentEffects } from './shared/note-content.effects';
import { NoteEditorService } from './shared/note-editor.service';
import { NoteParser } from './shared/note-parser';
import { noteReducerMap } from './shared/note.reducer';
import { NoteItemComponent } from './note-item/note-item.component';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteListToolsComponent } from './note-list-tools/note-list-tools.component';
import { CreateNewNoteDialogComponent } from './create-new-note-dialog/create-new-note-dialog.component';


@NgModule({
    imports: [
        UIModule,
        StoreModule.forFeature('note', noteReducerMap),
        EffectsModule.forFeature([
            NoteContentEffects,
        ]),
    ],
    declarations: [
        NoteEditorComponent,
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteListComponent,
        NoteListToolsComponent,
        CreateNewNoteDialogComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
        CreateNewNoteDialogComponent,
    ],
    providers: [
        NoteCollectionService,
        NoteParser,
        NoteEditorService,
    ],
    exports: [
        NoteEditorComponent,
        NoteFinderComponent,
    ],
})
export class NoteModule {
}
