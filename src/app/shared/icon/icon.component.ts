import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { BemBlock } from '../../../common/bem-class';


@Component({
    selector: 'gd-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnInit, OnChanges {
    @Input() name: string;
    @Input() size = 'regular';
    @Input() color: string;
    iconClassName = '';
    className = new BemBlock('Icon');

    ngOnInit(): void {
        this.parseClassName();
    }

    ngOnChanges(): void {
        this.parseClassName();
    }

    private parseClassName() {
        this.iconClassName = `la la-${this.name}`;

        this.className.setModifier('size', this.size);

        if (this.color) {
            this.className.setModifier('color', this.color);
        }
    }
}
