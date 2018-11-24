import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { IconModule } from '../icon';
import { MenuItemComponent } from './menu-item.component';
import { MenuSeparatorComponent } from './menu-separator.component';
import { MenuTriggerDirective } from './menu-trigger.directive';
import { MenuComponent } from './menu.component';
import { NativeMenu } from './native-menu';
import { SelectMenuComponent } from './select-menu.component';


@NgModule({
    imports: [
        CommonModule,
        FlexModule,
        A11yModule,
        OverlayModule,
        PortalModule,
        IconModule,
    ],
    declarations: [
        MenuComponent,
        MenuItemComponent,
        MenuTriggerDirective,
        SelectMenuComponent,
        MenuSeparatorComponent,
    ],
    providers: [
        NativeMenu,
    ],
    exports: [
        MenuComponent,
        MenuItemComponent,
        MenuTriggerDirective,
        SelectMenuComponent,
        MenuSeparatorComponent,
    ],
})
export class MenuModule {
}
