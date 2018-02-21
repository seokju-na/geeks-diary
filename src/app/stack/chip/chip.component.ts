import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StackItem } from '../stack-viewer';


@Component({
    selector: 'gd-stack-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackChipComponent {
    @Input() stackItem: StackItem;
    @Input() size = 'regular';

    @HostBinding('attr.ariaLabel')
    private get attrAriaLabel() { return this.stackItem.name; }

    @HostBinding('attr.title')
    private get attrTitle() { return this.stackItem.name; }

    constructor(private sanitizer: DomSanitizer) {
    }

    getIconUrl(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            this.stackItem.iconFilePath);
    }
}
