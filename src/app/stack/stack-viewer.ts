import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, startWith } from 'rxjs/operators';
import * as iconMapJson from '../../assets/vendors/devicon/devicon.json';
import { SearchModel } from '../../common/search.model';
import { MonacoService } from '../core/monaco.service';
import { Stack, stackDefinitions, StackIcon } from './models';


export interface StackIconMap {
    name: string;
    tags: string[];
    versions: {
        svg: string[];
    };
}


@Injectable()
export class StackViewer {
    _stacks: Stack[];

    constructor(private monacoService: MonacoService) {
        this._stacks = this.makeStacks();
    }

    getStack(name: string): Stack | null {
        return this._stacks.find(stack => stack.name === name) || null;
    }

    search(query: string): Stack[] {
        return new SearchModel<Stack>()
            .setScoringStrategy(3, (stack, queryStr) =>
                stack.name.toLowerCase().indexOf(queryStr.toLowerCase()) === 0)
            .search(this._stacks, query);
    }

    searchAsObservable(queries: Observable<string>): Observable<Stack[]> {
        return queries.pipe(
            startWith(''),
            map(query => this.search(query)),
        );
    }

    private makeStacks(): Stack[] {
        const stacks: Stack[] = [];
        const iconMaps: StackIconMap[] = (<any>iconMapJson).map(item => Object.assign({}, item));
        const languages = this.monacoService.getLanguages();

        languages.forEach((language) => {
            let iconMap: StackIconMap;
            let icon: StackIcon;
            let color: string;
            const definition = stackDefinitions.find(def => def.languageName === language.id);

            if (definition && definition.iconName) {
                iconMap = iconMaps.find(item => item.name === definition.iconName);
                icon = {
                    iconName: iconMap.name,
                    tags: iconMap.tags,
                    versions: iconMap.versions.svg,
                };
            }

            if (definition && definition.color) {
                color = definition.color;
            }

            stacks.push(new Stack(language.id, icon, language, color));

            if (iconMap) {
                const indexOfIconMap = iconMaps.findIndex(item => item.name === iconMap.name);

                if (indexOfIconMap !== -1) {
                    iconMaps.splice(indexOfIconMap, 1);
                }
            }
        });

        iconMaps.forEach((iconMap) => {
            const icon = {
                iconName: iconMap.name,
                tags: iconMap.tags,
                versions: iconMap.versions.svg,
            };

            stacks.push(new Stack(iconMap.name, icon));
        });

        return stacks;
    }
}
