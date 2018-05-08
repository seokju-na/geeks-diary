import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Stack } from '../models';


@Component({
    selector: 'gd-stack-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackChipComponent {
    @Input() stack: Stack;
    @Input() size = 'regular';

    @HostBinding('attr.aria-label')
    private get attrAriaLabel() { return this.stack.name; }

    constructor(private sanitizer: DomSanitizer) {
    }

    isIconExists(): boolean {
        return this.stack.icon !== null;
    }

    getIconUrl(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.stack.iconFilePath);
    }
}
