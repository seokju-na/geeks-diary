import { Inject, Injectable, OnDestroy } from '@angular/core';
import { from, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { WORKSPACE_DATABASE, WorkspaceDatabase } from './workspace-database';
import { Themes } from '../ui/style';


@Injectable()
export class ThemeService implements OnDestroy {
    readonly setTheme = new Subject<Themes>();
    private readonly setThemeSubscription: Subscription;

    constructor(
        @Inject(WORKSPACE_DATABASE) private workspaceDB: WorkspaceDatabase,
    ) {
        this.setThemeSubscription = this.setTheme.asObservable().pipe(
            distinctUntilChanged(),
            debounceTime(50),
            tap(theme => this.applyThemeToHtml(theme)),
            switchMap(theme => from(this.workspaceDB.update({ theme }))),
        ).subscribe();
    }

    private _currentTheme: Themes | null = null;

    get currentTheme(): Themes | null {
        return this._currentTheme;
    }

    ngOnDestroy(): void {
        this.setThemeSubscription.unsubscribe();
    }

    applyThemeToHtml(theme: Themes): void {
        const elem: HTMLElement = document.getElementsByTagName('html')[0];

        if (this._currentTheme && elem.classList.contains(this._currentTheme)) {
            elem.classList.remove(this._currentTheme);
        }

        this._currentTheme = theme;
        elem.classList.add(this._currentTheme);
    }
}
