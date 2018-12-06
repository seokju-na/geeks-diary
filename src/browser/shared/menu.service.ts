import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IpcActionClient, IpcMessage } from '../../libs/ipc';
import { enterZone } from '../../libs/rx';


export enum MenuEvent {
    NEW_TEXT_SNIPPET = '[MenuEvent] New text snippet',
    NEW_CODE_SNIPPET = '[MenuEvent] New code snippet',
    INSERT_IMAGE = '[MenuEvent] Insert image',
    TOGGLE_NOTE_LIST = '[MenuEvent] Toggle note list',
    TOGGLE_VCS = '[MenuEvent] Toggle vcs',
    CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY = '[MenuEvent] Change editor view mode to editor only',
    CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY = '[MenuEvent] Change editor view mode to preview only',
    CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH = '[MenuEvent] Change editor view mode to show both',
}


@Injectable()
export class MenuService implements OnDestroy {
    private ipcClient = new IpcActionClient('menu');

    constructor(private ngZone: NgZone) {
    }

    ngOnDestroy(): void {
        this.ipcClient.destroy();
    }

    updateNoteEditorViewMenuState(
        activeMode: 'note-view-show-both' | 'note-view-editor-only' | 'note-view-preview-only',
    ): void {
        this.ipcClient.performAction<string, void>('updateNoteEditorViewMenuState', activeMode);
    }

    onMessage(): Observable<MenuEvent> {
        const parseMessage = (message: IpcMessage<any>): MenuEvent => {
            switch (message.name) {
                case 'newTextSnippet':
                    return MenuEvent.NEW_TEXT_SNIPPET;
                case 'newCodeSnippet':
                    return MenuEvent.NEW_CODE_SNIPPET;
                case 'insertImage':
                    return MenuEvent.INSERT_IMAGE;
                case 'toggleNoteList':
                    return MenuEvent.TOGGLE_NOTE_LIST;
                case 'toggleVcs':
                    return MenuEvent.TOGGLE_VCS;
                case 'changeEditorViewModeToEditorOnly':
                    return MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_EDITOR_ONLY;
                case 'changeEditorViewModeToPreviewOnly':
                    return MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_PREVIEW_ONLY;
                case 'changeEditorViewModeToShowBoth':
                    return MenuEvent.CHANGE_EDITOR_VIEW_MODE_TO_SHOW_BOTH;
                default:
                    return null;
            }
        };

        return this.ipcClient.onMessage<any>().pipe(
            enterZone(this.ngZone),
            map(parseMessage),
        );
    }
}
