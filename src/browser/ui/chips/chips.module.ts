import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipDirective, ChipRemoveDirective } from './chip';
import { ChipInputDirective } from './chip-input.directive';
import { ChipListComponent } from './chip-list.component';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        ChipDirective,
        ChipRemoveDirective,
        ChipListComponent,
        ChipInputDirective,
    ],
    exports: [
        ChipDirective,
        ChipRemoveDirective,
        ChipListComponent,
        ChipInputDirective,
    ],
})
export class ChipsModule {
}
