import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StackViewer } from '../../stack/stack-viewer';
import { floor10 } from '../../utils/math-extensions';
import { NoteContentSnippet, NoteContentSnippetTypes } from '../models';
import { NoteStateWithRoot } from '../reducers';


export interface NotePreviewLanguageInfo {
    name: string;
    label: string;
    color: string;
    count: number;
    percent: number;
    percentDisplay: string;
}


@Component({
    selector: 'gd-note-preview-language-chart',
    templateUrl: './language-chart.component.html',
    styleUrls: ['./language-chart.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotePreviewLanguageChartComponent implements OnInit, OnDestroy {
    languageChart: NotePreviewLanguageInfo[] = [];
    private storeSubscription: Subscription;

    constructor(
        private store: Store<NoteStateWithRoot>,
        private stackViewer: StackViewer,
        private changeDetector: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.storeSubscription = this.store
            .pipe(
                select(state => state.note.editor),
                filter(editorState => editorState.loaded),
            )
            .subscribe((editorState) => {
                const codeSnippets = editorState.selectedNoteContent.snippets
                    .filter(snippet => snippet.type === NoteContentSnippetTypes.CODE);

                this.makeChart(codeSnippets);
            });
    }

    ngOnDestroy(): void {
        if (this.storeSubscription) {
            this.storeSubscription.unsubscribe();
        }
    }

    private makeChart(codeSnippets: NoteContentSnippet[]): void {
        const chart: NotePreviewLanguageInfo[] = [];
        const snippetsCount = codeSnippets.length;

        if (snippetsCount === 0) {
            this.languageChart = [];
            this.changeDetector.detectChanges();
            return;
        }

        const makePercentDisplay = (percent: number) => `${floor10(percent, -1)}`;
        const makeLabel = (name: string, percent: number) =>
            `${name} ${floor10(percent, -1)}%`;

        const LANGUAGE_NAME_PLACEHOLDER = 'Unknown';

        for (const snippet of codeSnippets) {
            const target = chart.find(info => info.name === snippet.language);
            let percent: number;

            if (target) {
                target.count += 1;
                percent = target.count * 100 / snippetsCount;
                target.percent = percent;
                target.percentDisplay = makePercentDisplay(percent);
                target.label = makeLabel(target.name, percent);
            } else {
                percent = 100 / snippetsCount;

                const name = snippet.language || LANGUAGE_NAME_PLACEHOLDER;
                const stack = snippet.language
                    ? this.stackViewer.getStack(snippet.language)
                    : null;

                chart.push({
                    name,
                    // TODO : Constants default color.
                    color: stack ? stack.color : '#343a40',
                    count: 1,
                    percent,
                    percentDisplay: makePercentDisplay(percent),
                    label: makeLabel(name, percent),
                });
            }
        }

        chart.sort((a, b) => b.count - a.count);

        this.languageChart = chart;
        this.changeDetector.detectChanges();
    }
}
