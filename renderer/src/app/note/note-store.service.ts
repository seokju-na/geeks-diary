import { Injectable } from '@angular/core';
import * as path from 'path';
import * as moment from 'moment';
import { kebabCase } from 'lodash';
import fm from 'front-matter';
import yaml from 'js-yaml';
import generateUUId from 'uuid/v4';
import { readFile, readdir, writeFile } from '../utils/fs-helpers';
import { asyncForEach } from '../utils/async-helpers';


export interface NoteMetadata {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface InternalMatterData {
    attributes: NoteMetadata;
    body: string;
}

export class Note {
    id: string;
    filename: string;
    title: string;
    createdAt: string;
    updatedAt?: string;

    static transformTitleToFilename(title: string): string {
        const dateStr = moment().format('YYYY-MM-DD');

        return `${dateStr}-${kebabCase(title)}.md`;
    }

    static async isFileValid(filename: string): Promise<boolean> {
        try {
            const fileData = await readFile(filename);
            Note.parseFileData(fileData);
            return true;
        } catch (err) {
            return false;
        }
    }

    static parseFileData(fileData: Buffer): InternalMatterData {
        const fileDataStr = fileData.toString();

        if (!fm.test(fileDataStr)) {
            throw new Error('Cannot parse file data');
        }

        return fm(fileDataStr);
    }

    static async createFromFile(filename: string): Promise<Note> {
        const fileData = await readFile(filename);
        const metadata = Note.parseFileData(fileData);

        return new Note(filename, metadata.attributes);
    }

    static async createNew(filename: string, title: string): Promise<Note> {
        const id: string = generateUUId();
        const timestamp = new Date().toString();

        const metadata: NoteMetadata = {
            id,
            title,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        const note = new Note(filename, metadata);
        await note.saveWithBody('');

        return note;
    }

    constructor(filename: string, metadata: NoteMetadata) {
        this.id = metadata.id;
        this.filename = filename;
        this.title = metadata.title;
        this.createdAt = metadata.createdAt;
        this.updatedAt = metadata.updatedAt;
    }

    async readBody(): Promise<string> {
        const fileData = await readFile(this.filename);

        return Note.parseFileData(fileData).body;
    }

    async saveWithBody(body): Promise<void> {
        await writeFile(this.filename, this.toString(body));
    }

    toString(body: string): string {
        const dump: NoteMetadata = {
            id: this.id,
            title: this.title,
            createdAt: new Date(this.createdAt).toString(),
            updatedAt: new Date(this.updatedAt).toString()
        };

        const attributes = yaml.safeDump(dump, { indent: 4 });
        const matterData = `---\n${attributes}\n---`;

        return `${matterData}\n${body}`;
    }
}

@Injectable()
export class NoteStore {
    // TODO: Separate path configuration such like environment.
    static noteArchivePath = `/geeks-diary`;
    notes: Note[] = [];
    selection: (Note | null) = null;
    selectionNoteBody = '';

    constructor() {
    }

    hasSelectionNote(): boolean {
        return this.selection !== null;
    }

    async readNoteList(): Promise<void> {
        let itemPaths = await readdir(NoteStore.noteArchivePath);

        itemPaths = itemPaths.map(item =>
            path.resolve(NoteStore.noteArchivePath, item));

        await asyncForEach(itemPaths, async (filename) => {
            if (await Note.isFileValid(filename)) {
                const note = await Note.createFromFile(filename);
                this.notes.push(note);
            }
        });
    }

    async readSelectionNoteBody(): Promise<string | null> {
        if (this.selection) {
            return this.selection.readBody();
        }

        return null;
    }

    async selectNoteById(noteId: string): Promise<void> {
        const note = this.notes.find(n => n.id === noteId);

        if (note) {
            this.selection = note;
        } else {
            this.selection = null;
        }
    }
}
