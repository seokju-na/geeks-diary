import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { NoteParser } from './note-parser';
import { NoteSnippetContentToHtmlPipe } from './note-snippet-content-to-html.pipe';
import { NoteVcsItemFactory } from './note-vcs-item/note-vcs-item-factory';
import { NoteVcsItemComponent } from './note-vcs-item/note-vcs-item.component';


@NgModule({
    imports: [
        UiModule,
    ],
    providers: [
        NoteParser,
        NoteVcsItemFactory,
    ],
    declarations: [
        NoteSnippetContentToHtmlPipe,
        NoteVcsItemComponent,
    ],
    entryComponents: [
        NoteVcsItemComponent,
    ],
    exports: [
        NoteSnippetContentToHtmlPipe,
        NoteVcsItemComponent,
    ],
})
export class NoteSharedModule {
}
