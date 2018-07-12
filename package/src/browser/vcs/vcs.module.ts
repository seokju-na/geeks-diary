import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UIModule } from '../ui/ui.module';


@NgModule({
    imports: [
        HttpClientModule,
        UIModule,
    ],
    declarations: [],
})
export class VcsModule {
}
