import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { UiModule } from '../ui/ui.module';
import { NoteCollectionModule } from './note-collection';
import { NoteEditorModule } from './note-editor';
import { NoteSharedModule } from './note-shared';
import { noteReducerMap } from './note.reducer';


@NgModule({
    imports: [
        UiModule,
        NoteEditorModule,
        NoteCollectionModule,
        NoteSharedModule,
        StoreModule.forFeature('note', noteReducerMap),
    ],
    declarations: [],
    providers: [
    ],
    exports: [
        NoteEditorModule,
        NoteCollectionModule,
        NoteSharedModule,
    ],
})
export class NoteModule {
}
