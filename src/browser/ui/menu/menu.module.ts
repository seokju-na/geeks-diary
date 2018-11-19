import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MenuItemComponent } from './menu-item.component';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuComponent } from './menu.component';
import { NativeMenu } from './native-menu';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        OverlayModule,
        PortalModule,
    ],
    declarations: [
        MenuComponent,
        MenuItemComponent,
        MenuTriggerDirective,
    ],
    providers: [
        NativeMenu,
    ],
    exports: [
        MenuComponent,
        MenuItemComponent,
        MenuTriggerDirective,
    ],
})
export class MenuModule {
}
