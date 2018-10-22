import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutocompleteItemComponent } from './autocomplete-item.component';
import { AutocompleteTriggerDirective } from './autocomplete-trigger.directive';
import { AutocompleteComponent } from './autocomplete.component';


@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
    ],
    declarations: [
        AutocompleteComponent,
        AutocompleteItemComponent,
        AutocompleteTriggerDirective,
    ],
    exports: [
        AutocompleteComponent,
        AutocompleteItemComponent,
        AutocompleteTriggerDirective,
    ],
})
export class AutocompleteModule {
}
