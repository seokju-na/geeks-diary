export class StackIcon {
    iconName: string;
    tags: string[];
    versions: string[];
}


export class Stack {
    readonly name: string;
    readonly icon?: StackIcon | null = null;
    readonly iconFilePath?: string | null = null;
    readonly languageId?: string | null = null;
    readonly color?: string | null = null;
}


export function getStackIconFilePath(name: string, svgFiles: string[]): string {
    let iconName: string;
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

    return `assets/stack-icons/${name}/${iconName}.svg`;
}
