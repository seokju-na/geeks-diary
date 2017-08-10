import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ClassName } from '../../utils/class-name'

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.less']
})
export class ButtonComponent implements OnInit, OnChanges {
    @Input() buttonType = 'normal';
    @Input() buttonSize = 'regular';
    @Input() buttonTitle = '';
    @Input() loading = false;
    @Input() disabled = false;
    @Output() buttonClick = new EventEmitter();
    cn = new ClassName('Button');

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.parseClassName();
    }

    private parseClassName() {
        this.cn.setModifier('type', this.buttonType);
        this.cn.setModifier('size', this.buttonSize);

        if (this.loading) {
            this.cn.setModifier('is', 'loading');
        }
    }

    click() {
        this.buttonClick.emit();
    }
}
