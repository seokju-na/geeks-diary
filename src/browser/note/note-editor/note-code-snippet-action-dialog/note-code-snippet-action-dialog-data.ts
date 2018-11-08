export type NoteCodeSnippetActionDialogActionType = 'create' | 'edit';


export class NoteCodeSnippetActionDialogData {
    actionType: NoteCodeSnippetActionDialogActionType;
    codeLanguageId?: string;
    codeFileName?: string;
}
