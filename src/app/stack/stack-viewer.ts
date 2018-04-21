import { Injectable } from '@angular/core';
import * as iconMapJson from '../../assets/vendors/devicon/devicon.json';
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
    readonly stacks: Stack[];

    constructor(private monacoService: MonacoService) {
        this.stacks = this.makeStacks();
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

        return stacks;
    }
}
