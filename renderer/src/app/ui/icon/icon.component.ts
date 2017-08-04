import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ClassName } from '../../utils/class-name';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.less']
})
export class IconComponent implements OnInit, OnChanges {
    @Input() iconName: string;
    @Input() iconSize = 'regular';
    @Input() iconColor = 'black';
    iconClassName = '';
    cn = new ClassName('Icon');

    constructor() {
    }

    private parseClassName() {
        this.iconClassName = `la la-${this.iconName}`;

        this.cn.setModifier('size', this.iconSize);
        this.cn.setModifier('color', this.iconColor);
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.parseClassName();
    }
}
