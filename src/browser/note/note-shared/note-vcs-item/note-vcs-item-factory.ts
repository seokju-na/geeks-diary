import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { pipe } from 'rxjs';
import { take } from 'rxjs/operators';
import { VcsFileChange } from '../../../../core/vcs';
import { toPromise } from '../../../../libs/rx';
import { VcsItemConfig, VcsItemCreateResult, VcsItemFactory, VcsItemRef } from '../../../vcs/vcs-view';
import { NoteStateWithRoot } from '../../note.state';
import { NoteVcsItemComponent } from './note-vcs-item.component';


@Injectable()
export class NoteVcsItemFactory extends VcsItemFactory<NoteVcsItemComponent> {
    constructor(
        private store: Store<NoteStateWithRoot>,
    ) {
        super();
    }

    async create(fileChanges: VcsFileChange[]): Promise<VcsItemCreateResult<NoteVcsItemComponent>> {
        const usedFileChanges: VcsFileChange[] = [];
        const refs: VcsItemRef<NoteVcsItemComponent>[] = [];

        // Get notes first.
        const notes = await toPromise(this.store.pipe(
            select(state => state.note.collection.notes),
            pipe(take(1)),
        ));

        for (const note of notes) {
            let index: number;
            const willUseFileChanges: VcsFileChange[] = [];

            // Note file
            index = fileChanges.findIndex(change => change.absoluteFilePath === note.filePath);
            if (index !== -1) {
                willUseFileChanges.push(fileChanges[index]);
            }

            // Note content file
            index = fileChanges.findIndex(change => change.absoluteFilePath === note.contentFilePath);
            if (index !== -1) {
                willUseFileChanges.push(fileChanges[index]);
            }

            if (willUseFileChanges.length > 0) {
                const config: VcsItemConfig = {
                    title: note.title,
                    fileChanges: willUseFileChanges,
                };

                const ref = new VcsItemRef<NoteVcsItemComponent>(config);
                ref.component = NoteVcsItemComponent;

                usedFileChanges.push(...willUseFileChanges);
                refs.push(ref);
            }
        }

        return { refs, usedFileChanges };
    }
}
