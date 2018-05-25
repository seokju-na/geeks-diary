import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { appReducers } from './app-reducers';
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
        StoreModule.forRoot(appReducers),
        StoreDevtoolsModule.instrument(),
        EffectsModule.forRoot([]),
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
