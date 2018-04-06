import { Injectable } from '@angular/core';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    switchMap,
} from 'rxjs/operators';
import { SearchModel } from '../../common/search.model';
import { environment } from '../../environments/environment';
import { FsService } from '../core/fs.service';


interface DevIconMap {
    name: string;
    tags: string[];
    versions: {
        svg: string[];
    };
}


export class StackItem {
    // FIXME LATER
    // Might get an error here, when build electron app.
    // Should search more information about electron path policy.
    static iconStorePath = path.resolve(
        environment.config.basePath, 'assets/vendors/devicon/');

    readonly name: string;
    readonly iconFilePath: string;
    readonly tags: string[];

    static getIconFilePath(name: string, svgFiles: string[]): string {
        let iconName;
        const iconTypesOrderByPriority = [
            'original',
            'plain',
            'line',
            'original-wordmark',
            'plain-wordmark',
            'line-wordmark',
        ];

        for (const type of iconTypesOrderByPriority) {
            if (svgFiles.includes(type)) {
                iconName = `${name}-${type}`;
                break;
            }
        }

        return path.resolve(StackItem.iconStorePath, name, `${iconName}.svg`);
    }

    constructor(iconMap: DevIconMap) {
        this.name = iconMap.name;
        this.tags = iconMap.tags;
        this.iconFilePath = StackItem.getIconFilePath(this.name, iconMap.versions.svg);
    }

    isTagMatches(query: string): boolean {
        let matches = false;

        for (const tag of this.tags) {
            if (tag.match(query) !== null) {
                matches = true;
                break;
            }
        }

        return matches;
    }
}


@Injectable()
export class StackViewer {
    static iconMapFilePath = path.resolve(StackItem.iconStorePath, 'devicon.json');

    private _stacks = new BehaviorSubject<StackItem[]>([]);
    private hasStackLoaded = false;

    constructor(private fsService: FsService) {
    }

    stacks(): Observable<StackItem[]> {
        if (!this.hasStackLoaded) {
            this.loadStacks();
            this.hasStackLoaded = true;
        }

        return this._stacks.asObservable();
    }

    search(queries: Observable<string>): Observable<StackItem[]> {
        return queries.pipe(
            distinctUntilChanged(),
            debounceTime(50),
            switchMap(
                () => this.stacks(),
                (query, stacks) => ({ stacks, query }),
            ),
            map(({ stacks, query }) => this.rawSearch(stacks, query)),
        );
    }

    private rawSearch(stacks: StackItem[], query: string): StackItem[] {
        return new SearchModel<StackItem>()
            .setScoringStrategy(2, (stack, q) => stack.name.match(q) !== null)
            .setScoringStrategy(1, (stack, q) => stack.isTagMatches(q))
            .search(stacks, query);
    }

    private loadStacks(): void {
        const parseFileData = map((buffer: Buffer) =>
            JSON.parse(buffer.toString('utf8')));

        this.fsService
            .readFile(StackViewer.iconMapFilePath, 'utf8')
            .pipe(parseFileData)
            .subscribe((icons: DevIconMap[]) => {
                this._stacks.next(icons.map(icon => new StackItem(icon)));
            });
    }
}
