import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExpansionPanelDirective } from './expansion-panel.directive';
import { ExpansionTriggerDirective } from './expansion-trigger.directive';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        ExpansionTriggerDirective,
        ExpansionPanelDirective,
    ],
    exports: [
        ExpansionTriggerDirective,
        ExpansionPanelDirective,
    ],
})
export class ExpansionModule {
}
