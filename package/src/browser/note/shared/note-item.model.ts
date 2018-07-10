import { Note } from '../../../models/note';


export interface NoteItem extends Note {
    label?: string;
}
