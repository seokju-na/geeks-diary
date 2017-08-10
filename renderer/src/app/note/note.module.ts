import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UIModule } from '../ui/ui.module';

import { NoteStore } from './note-store.service';
import { OrderNotePipe } from './order-note.pipe';
import { NoteEditorComponent } from './editor/editor.component';
import { NoteFinderComponent } from './finder/finder.component';
import { DiaryCalendarComponent } from './diary-calendar/diary-calendar.component';
import { DateCellComponent } from './diary-calendar/date-cell.component';
import { NoteListComponent } from './note-list/note-list.component';


@NgModule({
    imports: [
        CommonModule,
        UIModule
    ],
    declarations: [
        OrderNotePipe,
        NoteEditorComponent,
        NoteFinderComponent,
        DiaryCalendarComponent,
        DateCellComponent,
        NoteListComponent
    ],
    providers: [
        NoteStore
    ],
    exports: [
        NoteEditorComponent,
        NoteFinderComponent
    ]
})
export class NoteModule {
}
