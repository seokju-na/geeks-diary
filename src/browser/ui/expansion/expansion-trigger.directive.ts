import { ENTER } from '@angular/cdk/keycodes';
import { Directive, HostListener, Input, OnInit } from '@angular/core';
import { ExpansionPanelDirective } from './expansion-panel.directive';


/**
 * UI that can be expanded/collapsed.
 *
 * @example
 * <button [gdExpansionTrigger]="panel">Trigger</button>
 * <div gdExpansionPanel #panel="gdExpansionPanel">Panel</div>
 */
@Directive({
    selector: '[gdExpansionTrigger]',
    host: {
        'class': 'ExpansionTrigger',
        '[class.ExpansionTrigger--triggered]': 'panelOpen',
        '[attr.aria-expanded]': 'panelOpen || null',
    },
})
export class ExpansionTriggerDirective implements OnInit {
    @Input('gdExpansionTrigger') panel: ExpansionPanelDirective;

    get panelOpen(): boolean {
        return this.panel && this.panel.expanded;
    }

    ngOnInit(): void {
        if (!this.panel) {
            throw new Error('Cannot find provided expansion panel!');
        }
    }

    toggle(): void {
        this.panel.expanded = !this.panel.expanded;
    }

    open(): void {
        this.panel.expanded = true;
    }

    close(): void {
        this.panel.expanded = false;
    }

    @HostListener('click')
    _handleClick(): void {
        this.toggle();
    }

    @HostListener('keydown', ['$event'])
    _handleKeydown(event: KeyboardEvent): void {
        if (event.keyCode === ENTER) {
            this.toggle();
        }
    }
}
