import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { UiModule } from '../../ui/ui.module';
import { NoteSharedModule } from '../note-shared';
import { CreateNewNoteDialogComponent } from './create-new-note-dialog/create-new-note-dialog.component';
import { NoteCalendarComponent } from './note-calendar/note-calendar.component';
import { NoteCollectionService } from './note-collection.service';
import { NoteFinderComponent } from './note-finder/note-finder.component';
import { NoteItemComponent } from './note-item/note-item.component';
import { NoteListSortingMenu } from './note-list-sorting-menu';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteListToolsComponent } from './note-list-tools/note-list-tools.component';


@NgModule({
    imports: [
        UiModule,
        SharedModule,
        NoteSharedModule,
    ],
    declarations: [
        NoteCalendarComponent,
        NoteFinderComponent,
        NoteListComponent,
        NoteItemComponent,
        NoteListToolsComponent,
        CreateNewNoteDialogComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
        CreateNewNoteDialogComponent,
    ],
    providers: [
        NoteCollectionService,
        NoteListSortingMenu,
    ],
    exports: [
        NoteFinderComponent,
        NoteItemComponent,
    ],
})
export class NoteCollectionModule {
}
