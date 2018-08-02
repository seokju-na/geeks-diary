import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CoreModule } from '../core/core.module';
import { NoteModule } from '../note/note.module';
import { UIModule } from '../ui/ui.module';
import { AppComponent } from './app.component';
import { appReducer } from './shared/app.reducer';
import { SidenavComponent } from './sidenav/sidenav.component';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(appReducer),
        StoreDevtoolsModule.instrument(),
        EffectsModule.forRoot([]),
        CoreModule,
        UIModule,
        NoteModule,
    ],
    declarations: [
        AppComponent,
        SidenavComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
