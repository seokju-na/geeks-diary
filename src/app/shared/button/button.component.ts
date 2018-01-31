import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { BemBlock } from '../../../common/bem-class';


@Component({
    selector: 'gd-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent implements OnChanges {
    @Input() type = 'normal';
    @Input() size = 'regular';
    @Input() disabled = false;

    className = new BemBlock('Button');

    ngOnChanges(): void {
        this.className
            .setModifier('type', this.type)
            .setModifier('size', this.size);
    }
}
