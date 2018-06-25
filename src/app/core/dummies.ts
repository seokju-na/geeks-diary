import { NoteMetadataDummyFactory } from '../note/dummies';
import { UserData } from './models';


export class UserDataDummyFactory {
    lastOpenedNote = new NoteMetadataDummyFactory();

    create(): UserData {
        return {
            lastOpenedNote: this.lastOpenedNote.create(),
        };
    }
}
