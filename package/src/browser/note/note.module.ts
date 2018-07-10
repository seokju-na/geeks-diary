import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { UIModule } from '../ui/ui.module';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { NoteFinderComponent } from './note-finder/note-finder.component';
import { NoteCalendarComponent } from './note-calendar/note-calendar.component';
import { noteReducerMap } from './shared/note.reducer';


@NgModule({
    imports: [
        UIModule,
        StoreModule.forFeature('note', noteReducerMap),
    ],
    declarations: [
        NoteEditorComponent,
        NoteFinderComponent,
        NoteCalendarComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
    ],
    exports: [
        NoteEditorComponent,
        NoteFinderComponent,
    ],
})
export class NoteModule {
}
