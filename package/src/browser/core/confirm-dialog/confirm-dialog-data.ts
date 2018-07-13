export interface ConfirmDialogData {
    /** Title to display if it is set. */
    title?: string;

    /** Content to show. Format is 'html'. */
    content: string;

    /** When dialog is alert, dialog has only cancel button. */
    isAlert?: boolean;

    /** Alert button string. */
    alertButtonString?: string;

    /** Confirm button string. */
    confirmButtonString?: string;

    /** Cancel button string. */
    cancelButtonString?: string;
}
