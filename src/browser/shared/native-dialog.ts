import { Injectable, NgZone } from '@angular/core';
import { remote } from 'electron';
import { Observable } from 'rxjs';
import { enterZone } from '../../libs/rx';


const { BrowserWindow, dialog } = remote;


export enum NativeDialogProperties {
    OPEN_FILE = 1,
    OPEN_DIRECTORY = 2,
    MULTI_SELECTIONS = 4,
    SHOW_HIDDEN_FILES = 8,
}


export const nativeDialogFileFilters: {
    [key: string]: { name: string, extensions: string[] },
} = {
    ALL: { name: 'All', extensions: ['*'] },
    IMAGES: { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'gif'] },
};


export class NativeDialogConfig {
    /** [macOS] Message to display above input boxes. */
    message?: string;

    /** Allows the dialog to attach itself to a parent window. */
    isModal?: boolean = false;

    /** Specifies an array of file types that can be displayed or selected. */
    fileFilters?: { name: string, extensions: string[] }[] = [];

    /** Contains which features the dialog should use. */
    properties?: NativeDialogProperties;
}


export interface NativeDialogOpenResult {
    isSelected: boolean;
    filePaths?: string[];
}


/**
 * Service for using native dialog.
 */
@Injectable()
export class NativeDialog {
    constructor(private ngZone: NgZone) {
    }

    /**
     * Show open dialog. Output stream of file paths.
     * See details:
     *  https://electronjs.org/docs/api/dialog
     *
     * @example
     * nativeDialog.showOpenDialog({
     *     message: 'This only visible in macOS',
     *     isModal: true,
     *     fileFilters: [
     *         { name: 'All Files', extensions: ['*'] },
     *         { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
     *     ],
     *     properties: NativeDialogProperties.OPEN_FILE & NativeDialogProperties.OPEN_DIRECTORY,
     * }).afterClosed().subscribe((result) => {
     *     if (result.isSelected) {
     *         // do something with 'result.filePaths' ...
     *     }
     * });
     */
    showOpenDialog(config: NativeDialogConfig): Observable<NativeDialogOpenResult> {
        const _config = this.withDefaultConfig(config);

        return new Observable<NativeDialogOpenResult>((observer) => {
            dialog.showOpenDialog(_config.isModal ? undefined : BrowserWindow.getFocusedWindow(), {
                message: _config.message,
                filters: _config.fileFilters,
                properties: this.makeProperties(_config),
            }, (filePaths: string[] | undefined) => {
                const result: NativeDialogOpenResult = { isSelected: filePaths !== undefined };

                if (result.isSelected) {
                    result.filePaths = filePaths;
                }

                observer.next(result);
                observer.complete();
            });
        }).pipe(enterZone(this.ngZone));
    }

    private makeProperties(config: NativeDialogConfig): any[] {
        const properties: string[] = [];

        if (config.properties & NativeDialogProperties.OPEN_FILE) {
            properties.push('openFile');
        }

        if (config.properties & NativeDialogProperties.OPEN_DIRECTORY) {
            properties.push('openDirectory');
        }

        if (config.properties & NativeDialogProperties.MULTI_SELECTIONS) {
            properties.push('multiSelections');
        }

        if (config.properties & NativeDialogProperties.SHOW_HIDDEN_FILES) {
            properties.push('showHiddenFiles');
        }

        return properties;
    }

    private withDefaultConfig(config: NativeDialogConfig): NativeDialogConfig {
        return {
            ...new NativeDialogConfig(),
            ...config,
        };
    }
}
