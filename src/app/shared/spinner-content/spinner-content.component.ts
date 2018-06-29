import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'gd-spinner-content',
    templateUrl: './spinner-content.component.html',
    styleUrls: ['./spinner-content.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerContentComponent implements OnInit {
    @Input() pending = false;
    @Input() hideContentWhenPending = false;

    constructor() { }

    ngOnInit() {
    }

}
