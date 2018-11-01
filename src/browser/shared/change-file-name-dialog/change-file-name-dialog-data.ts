export interface ChangeFileNameDialogData {
    showWarning?: boolean;

    /** Message for dialog. */
    message?: string;

    /** Directory path which file gonna saved. */
    directoryPath: string;

    /** Input file name which user want's to change. */
    fileName?: string;
}
