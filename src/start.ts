import * as vscode from 'vscode';
import { Importer } from './importer';
import HTMLDocumentContentProvider from './TextDocumentContentProvider';

export class Start {
    private importer: Importer;
    private htmlProvider: HTMLDocumentContentProvider;


    constructor(importer, textProvider) {
        this.importer = importer;
        this.htmlProvider = textProvider;
    }

    start() {
        const that = this;
        return this.importer.getMatchingGlobalSettings().then(mappedSettings => {
            if (!mappedSettings || !mappedSettings.length) {
                vscode.window.showInformationMessage(`We found no settings from Sublime Text that match VS Code settings.`);
                return;
            }
            return that.htmlProvider.createInitialTable(mappedSettings);
        });
    }
}