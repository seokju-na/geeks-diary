import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NoteStateWithRoot } from '../../note.state';
import { ChangeViewModeAction } from '../note-collection.actions';
import { NoteCollectionViewModes } from '../note-collection.state';
import { NoteListSortingMenu } from '../note-list-sorting-menu';


@Component({
    selector: 'gd-note-list-tools',
    templateUrl: './note-list-tools.component.html',
    styleUrls: ['./note-list-tools.component.scss'],
})
export class NoteListToolsComponent implements OnInit, OnDestroy {
    readonly viewModeOptions = [
        {
            name: 'viewDetail',
            value: NoteCollectionViewModes.VIEW_DETAIL,
            iconName: 'reorder',
        },
        {
            name: 'viewSimple',
            value: NoteCollectionViewModes.VIEW_SIMPLE,
            iconName: 'align-justify',
        },
    ];
    readonly viewModeFormControl = new FormControl(this.viewModeOptions[0].value);


    private viewModeChangeSubscription = Subscription.EMPTY;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private sortingMenu: NoteListSortingMenu,
    ) {
    }

    ngOnInit(): void {
        this.viewModeChangeSubscription =
            this.viewModeFormControl.valueChanges.subscribe((viewMode) => {
                this.store.dispatch(new ChangeViewModeAction({ viewMode }));
            });
    }

    ngOnDestroy(): void {
        this.viewModeChangeSubscription.unsubscribe();
    }

    openSortingMenu(): void {
        this.sortingMenu.open();
    }
}
