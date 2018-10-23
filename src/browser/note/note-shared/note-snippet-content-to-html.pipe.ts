import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NoteSnippetContent } from '../note-editor';
import { NoteParser } from './note-parser';


@Pipe({
    name: 'noteContentSnippetValueToHtml',
})
export class NoteSnippetContentToHtmlPipe implements PipeTransform {
    constructor(
        private parser: NoteParser,
        private sanitizer: DomSanitizer,
    ) {
    }

    transform(snippet: NoteSnippetContent): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(
            this.parser.convertSnippetContentToHtml(snippet),
        );
    }
}
