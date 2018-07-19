import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { UIModule } from '../ui/ui.module';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NoteFinderComponent } from './note-finder/note-finder.component';
import { NoteCalendarComponent } from './note-calendar/note-calendar.component';
import { NoteCollectionService } from './shared/note-collection.service';
import { NoteParser } from './shared/note-parser';
import { noteReducerMap } from './shared/note.reducer';
import { NoteItemComponent } from './note-item/note-item.component';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteListToolsComponent } from './note-list-tools/note-list-tools.component';


@NgModule({
    imports: [
        UIModule,
        StoreModule.forFeature('note', noteReducerMap),
    ],
    declarations: [
        NoteEditorComponent,
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteListComponent,
        NoteListToolsComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
    ],
    providers: [
        NoteCollectionService,
        NoteParser,
    ],
    exports: [
        NoteEditorComponent,
        NoteFinderComponent,
    ],
})
export class NoteModule {
}
