import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsideComponent } from './aside/aside.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [AsideComponent],
    providers: [],
    exports: [
        AsideComponent
    ]
})
export class CoreModule {
}
