import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NoteParser } from './note-parser';
import { NoteSnippetContentToHtmlPipe } from './note-snippet-content-to-html.pipe';


@NgModule({
    imports: [
        CommonModule,
    ],
    providers: [
        NoteParser,
    ],
    declarations: [
        NoteSnippetContentToHtmlPipe,
    ],
    exports: [
        NoteSnippetContentToHtmlPipe,
    ],
})
export class NoteSharedModule {
}
