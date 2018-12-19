import { Injectable } from '@angular/core';
import { SearchModel } from '../../core/search';
import { languageAndIconAndColorMap } from './languages';
import { getStackIconFilePath, Stack } from './stack.model';


interface DevIcon {
    name: string;
    tags: string[];
    versions: {
        svg: string[];
    };
}


const devIcons = require('../../assets/vendors/devicon/devicon.json') as DevIcon[];


@Injectable()
export class StackViewer {
    readonly stacks: Stack[];

    constructor() {
        this.stacks = this.makeStacks();
    }

    getStack(name: string): Stack | null {
        return this.stacks.find(stack => stack.name === name) || null;
    }

    getStackWithSafe(name: string): Stack {
        let stack = this.getStack(name);

        if (stack === null) {
            stack = { name } as Stack;
        }

        return stack;
    }

    search(query: string): Stack[] {
        return new SearchModel<Stack>()
            .registerScoringStrategy(3, (stack, _query) =>
                stack.name.toLowerCase().indexOf(_query.toLowerCase()) === 0,
            )
            .search(this.stacks, query);
    }

    private makeStacks(): Stack[] {
        const stacks: Stack[] = [];
        const _devIcons = [...devIcons];

        languageAndIconAndColorMap.forEach((map) => {
            let stack: Stack = {
                name: map.id,
                languageId: map.id,
                color: map.color,
            };

            let devIcon: DevIcon = null;

            if (map.icon) {
                devIcon = _devIcons.find(icon => icon.name === map.icon);
                stack = {
                    ...stack,
                    icon: devIcon ? {
                        iconName: devIcon.name,
                        tags: [...devIcon.tags],
                        versions: [...devIcon.versions.svg],
                    } : null,
                    iconFilePath: devIcon ? getStackIconFilePath(devIcon.name, devIcon.versions.svg) : null,
                };

                if (devIcon) {
                    const index = _devIcons.findIndex(icon => icon.name === map.icon);
                    _devIcons.splice(index, 1);
                }
            }

            stacks.push(stack);
        });

        _devIcons.forEach((devIcon) => {
            stacks.push({
                name: devIcon.name,
                icon: {
                    iconName: devIcon.name,
                    tags: [...devIcon.tags],
                    versions: [...devIcon.versions.svg],
                },
            });
        });

        // Sort by stack name.
        stacks.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        });

        return stacks;
    }
}
