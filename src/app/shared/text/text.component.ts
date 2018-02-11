import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { BemBlock } from '../../../common/bem-class';


@Component({
    selector: 'gd-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextComponent implements OnInit, OnChanges {
    @Input() size = 'regular';
    @Input() weight = 'regular';

    className = new BemBlock('Text');

    ngOnInit(): void {
        this.parseClassName();
    }

    ngOnChanges(): void {
        this.parseClassName();
    }

    private parseClassName(): void {
        this.className
            .setModifier('size', this.size)
            .setModifier('weight', this.weight);
    }
}
