export interface DialogPosition {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}

export class DialogConfig<D = any> {
    hasBackdrop = true;
    closeOnEscape = true;
    width = '';
    height = '';
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    position?: DialogPosition;
    data: D | null = null;
    autoFocus = true;
}
