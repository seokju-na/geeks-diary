import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Dialog } from './dialog';
import { DialogContainerComponent } from './dialog-container.component';
import { DIALOG_SCROLL_STRATEGY_PROVIDER } from './dialog-injectors';
import { DialogTitleDirective } from './dialog-title.directive';
import { DialogHeaderDirective } from './dialog-header.directive';
import { DialogContentDirective } from './dialog-content.directive';
import { DialogActionsDirective } from './dialog-actions.directive';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        A11yModule,
    ],
    declarations: [
        DialogContainerComponent,
        DialogTitleDirective,
        DialogHeaderDirective,
        DialogContentDirective,
        DialogActionsDirective,
    ],
    entryComponents: [
        DialogContainerComponent,
    ],
    providers: [
        Dialog,
        DIALOG_SCROLL_STRATEGY_PROVIDER,
    ],
    exports: [
        DialogContainerComponent,
        DialogTitleDirective,
        DialogHeaderDirective,
        DialogContentDirective,
        DialogActionsDirective,
    ],
})
export class DialogModule {
}
