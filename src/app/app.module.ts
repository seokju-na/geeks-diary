import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppShellComponent } from './app-shell.component';
import { SharedModule } from './shared/shared.module';


@NgModule({
    imports: [
        BrowserModule,
        SharedModule
    ],
    declarations: [
        AppShellComponent
    ],
    providers: [],
    bootstrap: [AppShellComponent]
})
export class AppModule {
}
