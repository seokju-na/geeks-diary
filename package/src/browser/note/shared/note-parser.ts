// import { Injectable } from '@angular/core';
// import * as path from 'path';
// import { Observable } from 'rxjs';
// import { Note } from '../../../models/note';
// import { FsService } from '../../core/fs.service';
// import { WorkspaceService } from '../../core/workspace.service';
// import { NoteContent } from './note-content.model';
// import { NoteItem } from './note-item.model';
//
//
// @Injectable({
//     providedIn: 'root',
// })
// export class NoteParser {
//     constructor(
//         private fs: FsService,
//         private workspace: WorkspaceService,
//     ) {
//     }
//
//     generateNoteForUnrecordedContentFile(contentFileName: string): Observable<void> {
//         const now = new Date().getTime();
//         const newNote: Note = {
//             id: 'uniqueId',
//             title: path.basename(contentFileName, '.md'),
//             snippets: [],
//             stackIds: [],
//             contentFileName,
//             contentFilePath: this.resolveContentFilePath(contentFileName),
//             createdDatetime: now,
//             updatedDatetime: now,
//         };
//
//         // Save at 'geeks-diary.json'.
//         return null;
//     }
//
//     loadNoteContent(note: NoteItem): Observable<NoteContent> {
//         return null;
//     }
//
//     private resolveContentFilePath(contentFileName: string): string {
//         return path.resolve(this.workspace.workspaceDirPath, contentFileName);
//     }
// }
