import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { BemBlock } from '../../../common/bem-class';


@Component({
    selector: 'gd-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements OnInit, OnChanges {
    @Input() type = 'normal';
    @Input() size = 'regular';
    @Input() disabled = false;

    className = new BemBlock('Button');

    ngOnInit(): void {
        this.parseClassName();
    }

    ngOnChanges(): void {
        this.parseClassName();
    }

    private parseClassName(): void {
        this.className
            .setModifier('type', this.type)
            .setModifier('size', this.size);
    }
}
