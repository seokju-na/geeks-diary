import { Injectable } from '@angular/core';
import { MenuItemConstructorOptions } from 'electron';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { commonMenuLabels, NativeMenu } from '../../../ui/menu';


export type NoteItemContextMenuCommand = 'revealInFinder' | 'deleteNote';


@Injectable()
export class NoteItemContextMenu {
    constructor(private nativeMenu: NativeMenu) {
    }

    open(): Observable<NoteItemContextMenuCommand | undefined> {
        return this.nativeMenu.open(this.buildTemplate()).afterClosed().pipe(
            map(item => item ? item.id as NoteItemContextMenuCommand : undefined),
        );
    }

    private buildTemplate(): MenuItemConstructorOptions[] {
        return [
            {
                id: 'revealInFinder',
                label: commonMenuLabels.revealInFileManager,
            },
            {
                id: 'deleteNote',
                label: `Move Note to ${commonMenuLabels.trashName}`,
            },
        ];
    }
}
