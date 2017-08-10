import { Component, OnInit, Input } from '@angular/core';
import { DateCell } from '../../ui/calendar/calendar-table';
import { ClassName } from '../../utils/class-name';


@Component({
    selector: 'app-date-cell',
    templateUrl: './date-cell.component.html',
    styleUrls: ['./date-cell.component.less']
})
export class DateCellComponent implements OnInit {
    @Input() dateCell: DateCell;
    cn = new ClassName('DateCell');

    private parseClassName() {
        if (this.dateCell.isBlank) {
            this.cn.setModifier('is', 'blank');
        }
    }

    constructor() {
    }

    ngOnInit() {
        this.parseClassName();
    }

}
