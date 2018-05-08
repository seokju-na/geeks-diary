import * as path from 'path';
import { environment } from '../../environments/environment';


interface StackDefinition {
    languageName: string;
    iconName?: string;
    color?: string;
}


export const stackDefinitions: StackDefinition[] = [
    { languageName: 'typescript', iconName: 'typescript', color: '#2b7489' },
    { languageName: 'javascript', iconName: 'javascript', color: '#f1e05a' },
    { languageName: 'bat', color: '#89e051' },
    { languageName: 'coffeescript', iconName: 'coffeescript', color: '#244776' },
    { languageName: 'c', iconName: 'c', color: '#555555' },
    { languageName: 'cpp', iconName: 'cplusplus', color: '#f34b7d' },
    { languageName: 'csharp', iconName: 'csharp', color: '#178600' },
    { languageName: 'css', iconName: 'css3', color: '#563d7c' },
    { languageName: 'dockerfile', iconName: 'docker' },
    { languageName: 'fsharp', color: '#b845fc' },
    { languageName: 'go', iconName: 'go', color: '#375eab' },
    { languageName: 'handlebars', color: '#e44b23' }, // Same color with 'html'
    { languageName: 'html', iconName: 'html5', color: '#e44b23' },
    { languageName: 'ini' },
    { languageName: 'java', iconName: 'java', color: '#b07219' },
    { languageName: 'less', iconName: 'less', color: '#563d7c' }, // Same color with 'css'
    { languageName: 'lua', color: '#000080' },
    { languageName: 'msdax' },
    { languageName: 'mysql', iconName: 'mysql' },
    { languageName: 'objective-c', color: '#438eff' },
    { languageName: 'pgsql', iconName: 'postgresql' },
    { languageName: 'php', iconName: 'php', color: '#4F5D95' },
    { languageName: 'postiats', color: '#91de79' },
    { languageName: 'powershell', color: '#89e051' }, // Same color with 'shell'
    { languageName: 'pug', color: '#e44b23' }, // Same color with 'html'
    { languageName: 'python', iconName: 'python', color: '#3572A5' },
    { languageName: 'r', color: '#198ce7' },
    { languageName: 'razor' },
    { languageName: 'redis', iconName: 'redis' },
    { languageName: 'redshift' },
    { languageName: 'ruby', iconName: 'ruby', color: '#701516' },
    { languageName: 'rust', color: '#dea584' },
    { languageName: 'sb', color: '#945db7' }, // Same color with 'Visual Basic'
    { languageName: 'scss', iconName: 'sass', color: '#563d7c' }, // Same color with 'css'
    { languageName: 'sol' },
    { languageName: 'sql' },
    { languageName: 'swift', iconName: 'swift', color: '#ffac45' },
    { languageName: 'vb', iconName: 'visualstudio', color: '#945db7' },
    { languageName: 'xml', color: '#e44b23' }, // Same color with 'html'
    { languageName: 'yaml' },
];


export interface StackIcon {
    iconName: string;
    tags: string[];
    versions: string[];
}


export type StackLanguage = monaco.languages.ILanguageExtensionPoint;


export class Stack {
    static iconStorePath = path.resolve(
        environment.config.basePath, 'assets/vendors/devicon/');

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

        return path.resolve(Stack.iconStorePath, name, `${iconName}.svg`);
    }

    readonly name: string;
    readonly icon: StackIcon | null = null;
    readonly iconFilePath: string | null = null;
    readonly language: StackLanguage | null = null;
    readonly color: string | null = null;

    constructor(name: string, icon?: StackIcon, language?: StackLanguage, color?: string) {
        this.name = name;

        if (icon) {
            this.icon = icon;
            this.iconFilePath = Stack.getIconFilePath(this.icon.iconName, icon.versions);
        }

        if (language) {
            this.language = language;
        }

        if (color) {
            this.color = color;
        }
    }
}
