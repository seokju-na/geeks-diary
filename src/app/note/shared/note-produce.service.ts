import { Injectable } from '@angular/core';
import * as createUniqueId from 'uuid/v4';
import { datetime } from '../../../common/datetime';
import { NoteContent, NoteContentSnippetTypes, NoteMetadata } from '../models';
import { NoteFsService } from './note-fs.service';


@Injectable()
export class NoteProduceService {
    constructor(private noteFsService: NoteFsService) {
    }

    createNewNote(): {
        metadata: NoteMetadata;
        content: NoteContent;
    } {

        const id = createUniqueId();
        const title = 'Untitled Note';
        const stacks = [];
        const noteFileName = this.noteFsService.getNoteFileName(id);

        const metadata: NoteMetadata = {
            id,
            title,
            stacks,
            createdDatetime: datetime.today().getTime(),
            updatedDatetime: datetime.today().getTime(),
            fileName: this.noteFsService.getMetadataFileName(noteFileName),
            noteFileName,
        };

        const content: NoteContent = {
            noteId: id,
            title,
            stacks,
            snippets: [{
                id: createUniqueId(),
                type: NoteContentSnippetTypes.TEXT,
                value: 'Type contents...',
            }],
            fileName: this.noteFsService.getContentFileName(noteFileName),
            noteFileName,
        };

        return { metadata, content };
    }
}
