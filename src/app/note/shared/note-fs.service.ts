import { Injectable } from '@angular/core';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { zip } from 'rxjs/observable/zip';
import { catchError, filter, map, mapTo, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FsService } from '../../core/fs.service';
import { NoteContent, NoteMetadata } from '../models';


@Injectable()
export class NoteFsService {
    static readonly metadataFileName = 'meta.json';
    static readonly contentFileName = 'content.json';
    static readonly fileNameRegExp = /\.gd$/;

    readonly workspacePath: string;
    readonly noteStoragePath: string;

    constructor(private fsService: FsService) {
        this.workspacePath = path.resolve(environment.getPath('userData'), 'workspace/');
        this.noteStoragePath = path.resolve(this.workspacePath, 'notes/');
    }

    getNoteFileName(noteId: string): string {
        return path.resolve(this.noteStoragePath, `${noteId}.gd`);
    }

    getMetadataFileName(noteFileName: string): string {
        return path.resolve(noteFileName, NoteFsService.metadataFileName);
    }

    getContentFileName(noteFileName: string): string {
        return path.resolve(noteFileName, NoteFsService.contentFileName);
    }

    readNoteMetadataCollection(): Observable<NoteMetadata[]> {
        return this.fsService.readDirectory(this.noteStoragePath).pipe(
            switchMap((fileNames: string[]) => {
                fileNames = fileNames
                    .filter(fileName =>
                        NoteFsService.fileNameRegExp.test(fileName))
                    .map(fileName =>
                        path.resolve(this.noteStoragePath, fileName));

                const tasks = fileNames.map(fileName =>
                    this.readNoteMetadata(fileName)
                        .pipe(filter(data => data !== null)),
                );

                if (tasks.length === 0) {
                    return of([]);
                }

                return zip(...tasks);
            }),
        );
    }

    readNoteMetadata(noteFileName: string): Observable<NoteMetadata | null> {
        const metadataFileName = this.getMetadataFileName(noteFileName);

        return this.fsService.readFile(metadataFileName).pipe(
            map((buf: Buffer) => ({
                ...JSON.parse(buf.toString()),
                noteFileName,
                fileName: metadataFileName,
            })),
            catchError(() => of(null)),
        );
    }

    readNoteContent(noteFileName: string): Observable<NoteContent | null> {
        const contentFileName = this.getContentFileName(noteFileName);

        return this.fsService.readFile(contentFileName).pipe(
            map((buf: Buffer) => ({
                ...JSON.parse(buf.toString()),
                noteFileName,
                fileName: contentFileName,
            })),
            catchError(() => of(null)),
        );
    }

    writeNoteMetadata(metadata: NoteMetadata): Observable<void> {
        const value = NoteMetadata.convertToFileData(metadata);

        return this.fsService.writeFile(metadata.fileName, value);
    }

    writeNoteContent(content: NoteContent): Observable<void> {
        const value = NoteContent.convertToFileData(content);

        return this.fsService.writeFile(content.fileName, value);
    }

    createNote(
        metadata: NoteMetadata,
        content: NoteContent,
    ): Observable<void> {

        const noteFileName = metadata.noteFileName;
        const noteFilePath = path.resolve(this.noteStoragePath, noteFileName);

        return this.fsService.makeDirectory(noteFilePath).pipe(
            switchMap(() =>
                zip(this.writeNoteMetadata(metadata), this.writeNoteContent(content)),
            ),
            mapTo(null),
        );
    }
}
