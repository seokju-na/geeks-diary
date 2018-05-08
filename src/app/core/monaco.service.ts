import { Injectable } from '@angular/core';


@Injectable()
export class MonacoService {
    readonly _monaco: any = (<any>window).MONACO;
    readonly KeyMod = this._monaco.KeyMod;
    readonly KeyCode = this._monaco.KeyCode;

    createEditor(
        domEl: HTMLElement,
        options?: monaco.editor.IEditorConstructionOptions,
    ): monaco.editor.IStandaloneCodeEditor {

        return this._monaco.editor.create(domEl, options);
    }

    getLanguages(): monaco.languages.ILanguageExtensionPoint[] {
        return this._monaco.languages.getLanguages();
    }

    updateEditorLanguage(
        editor: monaco.editor.IStandaloneCodeEditor,
        language: string,
    ): void {

        this._monaco.editor.setModelLanguage(
            editor.getModel(),
            language,
        );
    }
}
