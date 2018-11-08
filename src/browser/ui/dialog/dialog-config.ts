/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog';


export interface DialogPosition {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}


export class DialogConfig<D = any> {
    /** The id of the dialog. */
    id?: string;

    /** Whether the dialog should focus the first focusable element on open. */
    autoFocus?: boolean = true;

    disableBackdropClickClose?: boolean = false;
    disableEscapeKeyDownClose?: boolean = false;

    /** Whether the dialog has a background. */
    hasBackdrop?: boolean = true;

    width?: string = '';
    maxWidth?: string = '80vw';
    minWidth?: string = '250px';

    height?: string = '';
    maxHeight?: string = '';
    minHeight?: string = '85px';

    position?: DialogPosition;

    /** Data to be injected into the dialog content. */
    data?: D | null = null;

    role?: DialogRole = 'dialog';
}
