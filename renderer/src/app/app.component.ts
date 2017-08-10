import { Component, OnInit } from '@angular/core';

import { ToolItem, ToolItemInterface } from './ui/tool-bar/tool-bar';
import { ClassName } from './utils/class-name';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    asideOpened = false;
    activityViewNavigators: ToolItemInterface[];
    globalActions: ToolItemInterface[];
    noteActions: ToolItemInterface[];
    cn = new ClassName('App');

    constructor() {
    }

    ngOnInit() {
        this.activityViewNavigators = [
            { title: 'Finder(⌘⇧E)' , iconName: 'folder' },
            { title: 'SCM(⌘⇧G)', iconName: 'git-square' }
        ];

        this.globalActions = [
            { title: 'Setting', iconName: 'cog' }
        ];

        this.noteActions = [
            { title: 'Change note view', iconName: 'eye' },
            { title: 'Discard note', iconName: 'trash' },
            { title: 'Export note', iconName: 'external-link' }
        ];

        this.parseClassName();
    }

    private parseClassName() {
        this.cn.setModifier('aside', this.asideOpened ? 'opened' : 'closed');
    }

    handleNoteAction(noteAction: ToolItem) {
        console.log(noteAction);
    }

    toggleAside() {
        this.asideOpened = !this.asideOpened;
        this.parseClassName();
    }
}
