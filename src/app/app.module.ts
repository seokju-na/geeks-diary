import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppShellComponent } from './app-shell.component';
import { CoreModule } from './core/core.module';
import { NoteModule } from './note/note.module';
import { SharedModule } from './shared/shared.module';
import { StackModule } from './stack/stack.module';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SharedModule,
        CoreModule,
        NoteModule,
        StackModule,
    ],
    declarations: [
        AppShellComponent,
    ],
    providers: [],
    bootstrap: [AppShellComponent],
})
export class AppModule {
}
