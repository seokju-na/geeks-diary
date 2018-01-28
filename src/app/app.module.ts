import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppShellComponent } from './app-shell.component';


@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        AppShellComponent
    ],
    providers: [],
    bootstrap: [AppShellComponent]
})
export class AppModule {
}
