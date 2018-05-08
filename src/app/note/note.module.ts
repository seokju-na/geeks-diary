import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { StackModule } from '../stack/stack.module';
import { NoteCalendarComponent } from './calendar/calendar.component';
import { NoteEffects } from './effects';
import { NoteFinderComponent } from './finder/finder.component';
import { NoteHeaderComponent } from './header/header.component';
import { NoteItemComponent } from './item/item.component';
import { NoteFsService } from './note-fs.service';
import { noteReducerMap } from './reducers';


@NgModule({
    imports: [
        SharedModule,
        StackModule,
        StoreModule.forFeature('note', noteReducerMap),
        EffectsModule.forFeature([NoteEffects]),
    ],
    declarations: [
        NoteFinderComponent,
        NoteCalendarComponent,
        NoteItemComponent,
        NoteHeaderComponent,
    ],
    entryComponents: [
        NoteFinderComponent,
    ],
    providers: [
        NoteFsService,
    ],
    exports: [
        NoteFinderComponent,
        NoteHeaderComponent,
    ],
})
export class NoteModule {
}
