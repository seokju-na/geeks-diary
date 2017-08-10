import { Component, EventEmitter, Input, Inject, Output, OnInit, OnChanges } from '@angular/core';
import { ToolBar, ToolItem, ToolItemInterface } from './tool-bar';
import { ClassName } from '../../utils/class-name';


@Component({
    selector: 'app-tool-bar',
    templateUrl: './tool-bar.component.html',
    styleUrls: ['./tool-bar.component.less']
})
export class ToolBarComponent implements OnInit, OnChanges {
    @Input() toolBarTitle = '';
    @Input() toolBarSize = 'regular';
    @Input() toolBarDirection = 'horizontal';
    @Input() toolItems: ToolItemInterface[] = [];
    @Output() toolBarClick: EventEmitter<ToolItem> = new EventEmitter();
    toolBar: ToolBar;
    cn = new ClassName('ToolBar');

    private parseClassName() {
        this.cn.setModifier('size', this.toolBarSize);
        this.cn.setModifier('direction', this.toolBarDirection);
    }

    private makeToolBar() {
        this.toolBar = this.toolBarFactory(this.toolItems);

        this.toolBar
            .setItems(this.toolItems)
            .setTitle(this.toolBarTitle);

        console.log(this.toolBar);
    }

    constructor(@Inject(ToolBar) private toolBarFactory: any) {}

    ngOnInit() {
    }

    ngOnChanges() {
        this.parseClassName();
        this.makeToolBar();
    }

    isItemSelected(toolItem: ToolItem): boolean {
        if (!this.toolBar.hasSelection()) {
            return false;
        }

        return this.toolBar.selection === toolItem;
    }

    clickToolItem(toolItem: ToolItem) {
        this.toolBar.setSelection(toolItem);
        this.toolBarClick.emit(toolItem);
    }
}
