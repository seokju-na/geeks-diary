import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from './core/core.module';
import { UIModule } from './ui/ui.module';
import { NoteModule } from './note/note.module';

import { AppComponent } from './app.component';


@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        CoreModule,
        UIModule,
        NoteModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
