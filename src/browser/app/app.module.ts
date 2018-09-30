import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { UiModule } from '../ui/ui.module';
import { AppComponent } from './app.component';
import { appReducer } from './app.reducer';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UiModule,
        StoreModule.forRoot(appReducer),
        StoreDevtoolsModule.instrument(),
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {
}
