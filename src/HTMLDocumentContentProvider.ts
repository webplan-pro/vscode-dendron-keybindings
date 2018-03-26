import * as vscode from 'vscode';
import { HTMLCreator } from './htmlCreation/htmlCreator'
import { JSDOM } from 'jsdom';
import { previewUri } from './consts';


export default class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange: vscode.EventEmitter<vscode.Uri>;

    constructor(private htmlCreator: HTMLCreator) {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
    }

    async provideTextDocumentContent(): Promise<string> {
        const htmlDoc: JSDOM = await this.htmlCreator.getHtmlAsync();
        return htmlDoc.serialize();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    update() {
        this._onDidChange.fire(previewUri);
    }
}