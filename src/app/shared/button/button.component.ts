import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
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
    @Output() click = new EventEmitter<Event>();

    className = new BemBlock('Button');

    ngOnInit(): void {
        this.parseClassName();
    }

    ngOnChanges(): void {
        this.parseClassName();
    }

    buttonClick(event: Event): void {
        this.click.emit(event);
    }

    private parseClassName(): void {
        this.className
            .setModifier('type', this.type)
            .setModifier('size', this.size);
    }
}
