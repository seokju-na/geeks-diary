import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TabGroupComponent } from './tab-group.component';
import { TabItemDirective } from './tab-item.directive';


@NgModule({
    imports: [
        FlexLayoutModule,
        CommonModule,
    ],
    declarations: [
        TabGroupComponent,
        TabItemDirective,
    ],
    exports: [
        TabGroupComponent,
    ],
})
export class TabsModule {
}
