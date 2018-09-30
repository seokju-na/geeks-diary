import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThemeService } from './theme.service';


@NgModule({
    imports: [CommonModule],
    providers: [
        ThemeService,
    ],
})
export class StyleModule {
}
