import { NgModule } from '@angular/core';
import { UiModule } from '../../ui/ui.module';
import { AppLayoutSidenavComponent } from './app-layout-sidenav/app-layout-sidenav.component';


@NgModule({
    imports: [
        UiModule,
    ],
    declarations: [
        AppLayoutSidenavComponent,
    ],
    exports: [
        AppLayoutSidenavComponent,
    ],
})
export class AppLayoutModule {
}
