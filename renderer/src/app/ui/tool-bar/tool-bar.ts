export interface ToolItemInterface {
    title: string;
    iconName: string;
    initSelection?: boolean;
    metadata?: any;
}

export class ToolItem {
    id: number;
    title: string;
    selected = false;
    iconName: string;
    metadata: any;

    constructor(data: ToolItemInterface) {
        this.title = data.title;
        this.selected = data.initSelection
            ? data.initSelection
            : false;
        this.iconName = data.iconName;
        this.metadata = data.metadata
            ? data.metadata
            : {};
    }
}

export class ToolBar {
    title: string;
    selection: ToolItem | null;
    items: ToolItem[];

    hasSelection(): boolean {
        return !!this.selection;
    }

    setItems(datas: ToolItemInterface[]): ToolBar {
        this.items = datas.map((data, index: number) => {
            const toolItem = new ToolItem(data);

            toolItem.id = index;

            return toolItem;
        });

        return this;
    }
    
    setTitle(title: string): ToolBar {
        this.title = title;
        return this;
    }

    setSelection(toolItem: ToolItem) {
        const target = this.items.find(t => t.id === toolItem.id);

        if (target) {
            this.selection = toolItem;
        }
    }
}

export function toolBarFactory(): ToolBar {
    return new ToolBar();
}
