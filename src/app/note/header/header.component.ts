import { Component } from '@angular/core';


interface NoteHeaderToolItem {
    name: string;
    description: string;
    iconName: string;
}


@Component({
    selector: 'gd-note-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
})
export class NoteHeaderComponent {
    toolItems: NoteHeaderToolItem[] = [
        { name: 'deleteNote', description: 'Delete note', iconName: 'trash-o' },
        { name: 'editorView', description: 'Switch editor view', iconName: 'eye' },
        { name: 'noteInfo', description: 'Show note info', iconName: 'info-circle' },
    ];
}
