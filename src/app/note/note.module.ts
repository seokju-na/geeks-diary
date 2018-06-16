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
import { NoteEditorToolbarComponent } from './editor/toolbar/toolbar.component';
import { NoteEditorEffects, NoteFinderEffects, NoteFsEffects } from './effects';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteHeaderComponent } from './header/header.component';
import { NoteViewModeSettingMenu } from './shared/note-view-mode-setting.menu';
import { NoteItemComponent } from './item/item.component';
import { NoteFsService } from './note-fs.service';
import { NotePreviewLanguageChartComponent } from './preview/language-chart.component';
import { NotePreviewComponent } from './preview/preview.component';
import { noteReducerMap } from './reducers';
import { NoteCollectionSortingMenu } from './shared/note-collection-sorting.menu';
import { NoteWorkspaceComponent } from './workspace/workspace.component';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
        StoreModule.forFeature('note', noteReducerMap),
        EffectsModule.forFeature([
            NoteFsEffects,
            NoteEditorEffects,
            NoteFinderEffects,
        ]),
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteHeaderComponent,
        NoteEditorCodeSnippetComponent,
        NoteEditorTextSnippetComponent,
        NoteEditorToolbarComponent,
        NoteEditorComponent,
        NotePreviewLanguageChartComponent,
        NotePreviewComponent,
        NoteWorkspaceComponent,
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
        NoteViewModeSettingMenu,
        NoteCollectionSortingMenu,
    ],
    exports: [
        NoteFinderComponent,
        NoteWorkspaceComponent,
    ],
})
export class NoteModule {
}
