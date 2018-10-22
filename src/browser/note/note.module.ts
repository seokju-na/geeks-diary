import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UiModule } from '../ui/ui.module';
import { NoteCollectionModule } from './note-collection';
import { NoteContentEffects, NoteEditorEffects, NoteEditorModule } from './note-editor';
import { NotePreviewModule } from './note-preview';
import { NoteSharedModule } from './note-shared';
import { noteReducerMap } from './note.reducer';


@NgModule({
    imports: [
        UiModule,
        NoteEditorModule,
        NoteCollectionModule,
        NoteSharedModule,
        NotePreviewModule,
        StoreModule.forFeature('note', noteReducerMap),
        EffectsModule.forFeature([
            NoteContentEffects,
            NoteEditorEffects,
        ]),
    ],
    declarations: [],
    providers: [
    ],
    exports: [
        NoteEditorModule,
        NoteCollectionModule,
        NotePreviewModule,
        NoteSharedModule,
    ],
})
export class NoteModule {
}
