import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared';
import { StackSharedModule } from '../../stack/stack-shared';
import { UiModule } from '../../ui/ui.module';
import { NoteSharedModule } from '../note-shared';
import { CreateNewNoteDialogComponent } from './create-new-note-dialog/create-new-note-dialog.component';
import { NoteCalendarComponent } from './note-calendar/note-calendar.component';
import { NoteCollectionService } from './note-collection.service';
import { NoteContributionService } from './note-contribution.service';
import { NoteFinderComponent } from './note-finder/note-finder.component';
import { NoteItemContextMenu } from './note-item/note-item-context-menu';
import { NoteItemComponent } from './note-item/note-item.component';
import { NoteListSortingMenu } from './note-list-sorting-menu';
import { NoteListComponent } from './note-list/note-list.component';
import { NoteListToolsComponent } from './note-list-tools/note-list-tools.component';


@NgModule({
    imports: [
        UiModule,
        SharedModule,
        NoteSharedModule,
        StackSharedModule,
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
        DatePipe,
        NoteCollectionService,
        NoteListSortingMenu,
        NoteContributionService,
        NoteItemContextMenu,
    ],
    exports: [
        NoteFinderComponent,
        NoteItemComponent,
    ],
})
export class NoteCollectionModule {
}
