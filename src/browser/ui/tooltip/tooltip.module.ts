import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';


@NgModule({
    imports: [
        A11yModule,
        CommonModule,
        OverlayModule,
    ],
    declarations: [
        TooltipComponent,
        TooltipDirective,
    ],
    entryComponents: [
        TooltipComponent,
    ],
    exports: [
        TooltipComponent,
        TooltipDirective,
    ],
})
export class TooltipModule {
}
