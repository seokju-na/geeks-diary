import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    Input,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TooltipDirective } from '../../ui/tooltip';
import { Stack } from '../stack.model';


@Component({
    selector: 'gd-stack-chip',
    templateUrl: './stack-chip.component.html',
    styleUrls: ['./stack-chip.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.aria-label]': 'stack?.name',
    },
})
export class StackChipComponent implements DoCheck {
    @Input() stack: Stack;
    @Input() disableTooltip = true;

    @ViewChild(TooltipDirective) _tooltip: TooltipDirective;

    constructor(
        private sanitizer: DomSanitizer,
        private changeDetector: ChangeDetectorRef,
    ) {
    }

    get isIconExists(): boolean {
        return this.stack && !!this.stack.iconFilePath;
    }

    get iconFileUrl(): SafeResourceUrl {
        if (!this.stack) {
            return '';
        } else {
            return this.sanitizer.bypassSecurityTrustResourceUrl(this.stack.iconFilePath);
        }
    }

    ngDoCheck(): void {
        if (this.stack && this.stack.name) {
            this.changeDetector.markForCheck();
        }
    }
}
