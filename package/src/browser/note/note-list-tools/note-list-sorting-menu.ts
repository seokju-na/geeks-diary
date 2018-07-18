import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MenuItemConstructorOptions } from 'electron';
import { switchMap, take } from 'rxjs/operators';
import { SortDirection } from '../../../libs/sorting';
import { Menu } from '../../ui/menu/menu';
import {
    ChangeSortDirectionAction,
    ChangeSortOrderAction,
    NoteCollectionActions,
} from '../shared/note-collection.actions';
import { NoteCollectionSortBy, NoteCollectionState } from '../shared/note-collection.state';
import { NoteStateWithRoot } from '../shared/note.state';


@Injectable()
export class NoteListSortingMenu {
    constructor(
        private store: Store<NoteStateWithRoot>,
        private menu: Menu,
    ) {
    }

    open(): void {
        this.store.pipe(
            select(state => state.note.collection),
            take(1),
            switchMap(state => this.menu
                .open(this.buildTemplate(state))
                .afterClosed(),
            ),
        ).subscribe((item) => {
            if (item) {
                this.handleMenuItemClick(item.id);
            }
        });
    }

    private buildTemplate(state: NoteCollectionState): MenuItemConstructorOptions[] {
        const template: MenuItemConstructorOptions[] = [
            {
                id: NoteCollectionSortBy.CREATED,
                type: 'checkbox',
                label: 'Date Created',
            },
            {
                id: NoteCollectionSortBy.UPDATED,
                type: 'checkbox',
                label: 'Date Updated',
            },
            {
                id: NoteCollectionSortBy.TITLE,
                type: 'checkbox',
                label: 'Title',
            },
            { type: 'separator' },
            {
                id: SortDirection.DESC,
                type: 'checkbox',
                label: 'Desc',
            },
            {
                id: SortDirection.ASC,
                type: 'checkbox',
                label: 'Asc',
            },
        ];

        template.forEach((item) => {
            item.checked = item.id === state.sortBy || item.id === state.sortDirection;
        });

        return template;
    }

    private handleMenuItemClick(id: string): void {
        let action: NoteCollectionActions;

        if (id === NoteCollectionSortBy.CREATED
            || id === NoteCollectionSortBy.UPDATED
            || id === NoteCollectionSortBy.TITLE) {

            action = new ChangeSortOrderAction({ sortBy: id });
        }

        if (id === SortDirection.DESC
            || id === SortDirection.ASC) {

            action = new ChangeSortDirectionAction({ sortDirection: id });
        }

        this.store.dispatch(action);
    }
}
