import { Component, OnInit } from '@angular/core';
import { ExampleDatabase } from '../../libs/database';
import { Themes, ThemeService } from '../core/theme.service';


@Component({
    selector: 'gd-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
    constructor(private theme: ThemeService) {
        const db = new ExampleDatabase();
        db.examples.get(1).then((example) => {
            if (example) {
                this.theme.setTheme(example.theme as Themes);
            }
        });
    }

    async ngOnInit(): Promise<void> {
    }
}
