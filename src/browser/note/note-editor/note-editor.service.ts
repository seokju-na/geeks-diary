import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as path from 'path';
import { Observable, zip } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, map, mapTo } from 'rxjs/operators';
import { Asset, AssetTypes } from '../../../core/asset';
import { Note } from '../../../core/note';
import { toPromise } from '../../../libs/rx';
import { FsService, WorkspaceService } from '../../shared';
import { ChangeFileNameDialog, ChangeFileNameDialogResult } from '../../shared/change-file-name-dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { NoteItem } from '../note-collection';
import { convertToNoteSnippets, NoteParser } from '../note-shared';
import { NoteContent } from './note-content.model';


@Injectable()
export class NoteEditorService {
    constructor(
        private fs: FsService,
        private parser: NoteParser,
        private datePipe: DatePipe,
        private workspace: WorkspaceService,
        private confirmDialog: ConfirmDialog,
        private changeFileNameDialog: ChangeFileNameDialog,
    ) {
    }

    copyAssetFile(
        type: AssetTypes,
        noteContentFilePath: string,
        filePath: string,
        destFileName?: string,
    ): Observable<Asset | null> {
        const { assetsDirPath } = this.workspace.configs;

        const extension = destFileName ? path.extname(destFileName) : path.extname(filePath);
        const fileName = destFileName ? destFileName : path.basename(filePath);
        const fileNameWithoutExtension = path.basename(fileName, extension);

        const destination = path.resolve(assetsDirPath, fileName);
        const relativePath = path
            .relative(path.dirname(noteContentFilePath), destination)
            .replace(/ /g, '%20'); // This is for supporting web url.

        const asset: Asset = {
            type,
            fileName,
            fileNameWithoutExtension,
            filePath: destination,
            extension,
            relativePathToWorkspaceDir: relativePath,
        };

        // An rich UI solution for file already exists problem.
        const changeFileNameAndSaveWhenFileAlreadyExists = async () => {
            const confirmed: boolean = await toPromise(this.confirmDialog.open({
                title: 'Copy',
                body: `'${fileName}' is already exists in assets directory.\nDo you want to rename the file?`,
                confirmButtonString: 'Change',
            }).afterClosed());

            if (!confirmed) {
                return null;
            }

            const result: ChangeFileNameDialogResult = await toPromise(this.changeFileNameDialog.open({
                directoryPath: assetsDirPath,
                fileName,
            }).afterClosed());

            if (result && result.isChanged) {
                return toPromise(this.copyAssetFile(type, noteContentFilePath, filePath, result.changedFileName));
            } else {
                return null;
            }
        };

        return this.fs.copyFile(filePath, destination, {
            overwrite: false,
            errorOnExist: true,
        }).pipe(
            mapTo(asset),
            catchError(() => fromPromise(changeFileNameAndSaveWhenFileAlreadyExists())),
        );
    }

    loadNoteContent(noteItem: NoteItem): Observable<NoteContent> {
        return zip(
            this.fs.readJsonFile<Note>(noteItem.filePath),
            this.fs.readFile(noteItem.contentFilePath),
        ).pipe(map(([note, contentRawValue]) => this.parser.generateNoteContent(note, contentRawValue)));
    }

    saveNote(noteItem: NoteItem, content: NoteContent): Observable<void> {
        const parseResult = this.parser.parseNoteContent(content, {
            metadata: {
                title: noteItem.title,
                date: this.datePipe.transform(noteItem.createdDatetime, 'E, d MMM yyyy HH:mm:ss Z'),
                stacks: noteItem.stackIds,
            },
        });

        const note: Note = {
            id: noteItem.id,
            title: noteItem.title,
            snippets: convertToNoteSnippets(parseResult.parsedSnippets),
            stackIds: noteItem.stackIds,
            label: noteItem.label,
            contentFileName: noteItem.contentFileName,
            createdDatetime: noteItem.createdDatetime,
        };

        return zip(
            this.fs.writeJsonFile<Note>(noteItem.filePath, note),
            this.fs.writeFile(noteItem.contentFilePath, parseResult.contentRawValue),
        ).pipe(mapTo(null));
    }
}
