import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IpcActionClient } from '../../libs/ipc';
import { enterZone } from '../../libs/rx';


export enum MenuEvent {
    NEW_TEXT_SNIPPET = '[MenuEvent] New text snippet',
    NEW_CODE_SNIPPET = '[MenuEvent] New code snippet',
    INSERT_IMAGE = '[MenuEvent] Insert image',
    TOGGLE_NOTE_LIST = '[MenuEvent] Toggle note list',
    TOGGLE_VCS = '[MenuEvent] Toggle vcs',
}


@Injectable()
export class MenuService implements OnDestroy {
    private ipcClient = new IpcActionClient('menu');

    constructor(private ngZone: NgZone) {
    }

    ngOnDestroy(): void {
        this.ipcClient.destroy();
    }

    onMessage(): Observable<MenuEvent> {
        return this.ipcClient.onMessage<any>().pipe(
            enterZone(this.ngZone),
            map((message) => {
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
                    default:
                        return null;
                }
            }),
        );
    }
}
