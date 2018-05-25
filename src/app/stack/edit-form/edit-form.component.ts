import {
    ChangeDetectionStrategy,
    Component, EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {
    AutocompleteTriggerDirective,
} from '../../shared/autocomplete/autocomplete-trigger.directive';
import { Stack } from '../models';
import { StackViewer } from '../stack-viewer';


@Component({
    selector: 'gd-stack-edit-form',
    templateUrl: './edit-form.component.html',
    styleUrls: ['./edit-form.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackEditFormComponent implements OnInit {
    @Input()
    get stacks() {
        return this._stacks;
    }

    set stacks(stacks: any) {
        if (!stacks) {
            return;
        }

        this._stacks = [...stacks];
    }

    @Output() stacksChanged = new EventEmitter<Stack[]>();

    stackSearch = new FormControl();
    filteredStacks: Observable<Stack[]>;
    private _stacks: Stack[] = [];

    @ViewChild(AutocompleteTriggerDirective) trigger: AutocompleteTriggerDirective;

    constructor(private stackViewer: StackViewer) {
    }

    ngOnInit(): void {
        this.filteredStacks = this.stackViewer.searchAsObservable(
            this.stackSearch.valueChanges,
        );
    }

    addStack(): void {
        const name = this.stackSearch.value;

        if (name.trim() === '') {
            return;
        }

        let stack = this.stackViewer.getStack(name);

        if (!stack) {
            stack = new Stack(name);
        }

        this._stacks.push(stack);
        this.stackSearch.patchValue('');
        this.trigger.closePanel();
        this.stacksChanged.emit(this._stacks);
    }

    removeStack(index): void {
        this._stacks.splice(index, 1);
        this.stacksChanged.emit(this._stacks);
    }
}
