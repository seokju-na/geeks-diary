import { NoteState } from '../../note/shared/note.state';
import { AppLayoutState } from './app-layout.state';


export interface AppState {
    layout: AppLayoutState;
}


export interface AppStateWithFeatures extends AppState {
    note: NoteState;
}
