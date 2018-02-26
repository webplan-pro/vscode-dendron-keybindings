// @ts-ignore
let listify = require('listify');   // FIXME:
import * as vscode from 'vscode';
const showInformationMessage = vscode.window.showInformationMessage
import { Importer } from './importer';
import HTMLDocumentContentProvider from './TextDocumentContentProvider';

enum Messages {
    yes = 'Yes',
    no = 'No',
    finished = 'Import from Sublime Text finished!',
    failed = 'Import failed :( '
}

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
                showInformationMessage(`We found no settings from Sublime Text that match VS Code settings.`);
                return;
            }
            return that.htmlProvider.createInitialTable(mappedSettings);
        });
    }
}