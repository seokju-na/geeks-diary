import { FocusKeyManager } from '@angular/cdk/a11y';
import { END, ENTER, HOME, SPACE } from '@angular/cdk/keycodes';
import {
    AfterViewInit,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Tab, TabControl } from './tab-control';
import { TabItemDirective } from './tab-item.directive';


@Component({
    selector: 'gd-tab-group',
    templateUrl: './tab-group.component.html',
    styleUrls: ['./tab-group.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        'class': 'TabGroup',
    },
})
export class TabGroupComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() tabControl: TabControl;

    @ViewChildren(TabItemDirective) _tabItems: QueryList<TabItemDirective>;

    /** Used to manage focus between the tabs. */
    private keyManager: FocusKeyManager<TabItemDirective>;

    /** Emits when the component is destroyed. */
    private readonly _destroyed = new Subject<void>();

    /** Tracks which element has focus; used for keyboard navigation */
    get focusIndex(): number {
        return this.keyManager ? this.keyManager.activeItemIndex : 0;
    }

    get tabs(): Tab[] {
        return this.tabControl ? this.tabControl.tabs : [];
    }

    ngOnInit(): void {
        if (!this.tabControl) {
            throw new Error('Tab control must be provided!');
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }

    ngAfterViewInit(): void {
        this.keyManager = new FocusKeyManager(this._tabItems)
            .withHorizontalOrientation('ltr')
            .withWrap();

        if (this.tabControl.activeTabIndex !== null) {
            this.keyManager.setActiveItem(this.tabControl.activeTabIndex);
        }

        this.keyManager.change.pipe(takeUntil(this._destroyed)).subscribe((newFocusIndex) => {
            if (this._tabItems && this._tabItems.length) {
                this._tabItems.toArray()[newFocusIndex].focus();
            }
        });
    }

    _onClickTab(index: number): void {
        this.keyManager.setActiveItem(index);
        this.tabControl.selectTabByIndex(index);
    }

    @HostListener('keydown', ['$event'])
    _handleKeydown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case HOME:
                this.keyManager.setFirstItemActive();
                this.tabControl.selectFirstTab();
                event.preventDefault();
                break;
            case END:
                this.keyManager.setLastItemActive();
                this.tabControl.selectLastTab();
                event.preventDefault();
                break;
            case ENTER:
            case SPACE:
                this.tabControl.selectTabByIndex(this.focusIndex);
                event.preventDefault();
                break;
            default:
                this.keyManager.onKeydown(event);
        }
    }

    _getTabIndex(index: number): number {
        return this.tabControl.activeTabIndex === index ? 0 : -1;
    }
}
