import { distanceInWordsToNow } from 'date-fns';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { VcsCommitItem } from '../../../../core/vcs';


@Component({
    selector: 'gd-vcs-commit-item',
    templateUrl: './vcs-commit-item.component.html',
    styleUrls: ['./vcs-commit-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'VcsCommitItem',
    },
})
export class VcsCommitItemComponent {
    @Input() commitItem: VcsCommitItem;

    get descriptionExists(): boolean {
        return this.commitItem
            && this.commitItem.description
            && this.commitItem.description.trim().length > 0;
    }

    get createdTimeDiff(): string {
        if (this.commitItem) {
            return distanceInWordsToNow(this.commitItem.timestamp);
        } else {
            return '';
        }
    }
}
