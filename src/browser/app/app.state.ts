import { NoteState } from '../note';
import { VcsState } from '../vcs';
import { AppLayoutState } from './app-layout';


export interface AppState {
    layout: AppLayoutState;
}


export interface AppStateWithFeatures extends AppState {
    note: NoteState;
    vcs: VcsState;
}
