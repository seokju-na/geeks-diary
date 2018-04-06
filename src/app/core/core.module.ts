import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FsService } from './fs.service';
import { SidebarComponent } from './sidebar/sidebar.component';


@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        SidebarComponent,
    ],
    providers: [
        FsService,
    ],
    exports: [
        SidebarComponent,
    ],
})
export class CoreModule {
}
