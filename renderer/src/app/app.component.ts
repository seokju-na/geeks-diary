import { Component, OnInit } from '@angular/core';
import { ClassName } from './utils/class-name';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    asideOpened = false;
    cn = new ClassName('App');

    constructor() {
    }

    ngOnInit() {
        this.parseClassName();
    }

    private parseClassName() {
        this.cn.setModifier('aside', this.asideOpened ? 'opened' : 'closed');
    }

    toggleAside() {
        this.asideOpened = !this.asideOpened;
        this.parseClassName();
    }
}
