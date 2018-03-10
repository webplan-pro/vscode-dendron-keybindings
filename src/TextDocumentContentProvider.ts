import * as vscode from 'vscode';
import { previewUri } from './consts';
import { HTMLCreator } from './gui/htmlCreator'
import { MappedSetting } from './mappedSetting';
import { JSDOM } from 'jsdom';


export default class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {

    private callUpdate: any;
    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private htmlCreator: HTMLCreator;
    private projectRoot: vscode.Uri;

    constructor(projectRoot: vscode.Uri) {
        this.callUpdate = null;
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this.htmlCreator = new HTMLCreator(projectRoot);
        this.projectRoot = projectRoot;
    }

    async provideTextDocumentContent(): Promise<string> {
        const htmlDoc: JSDOM = await this.htmlCreator.getHtmlAsync();
        return htmlDoc.serialize();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    // update(newData: Setting[]) {
    //     const that = this;
    //     return this.html.then((html: string) => {
    //         const trChars = '</tr>';
    //         const insertAt = html.lastIndexOf(trChars) + trChars.length;

    //         const newTRs = that.createTRs(newData);
    //         this._html = this._html.slice(0, insertAt) + newTRs + this._html.slice(insertAt);
    //         this._onDidChange.fire(previewUri);
    //     });
    // }

    async createInitialTableAsync(newData: MappedSetting[]): Promise<void> {
        const reset = true;
        const htmlContent: JSDOM = await this.htmlCreator.getHtmlAsync(reset);
        this.htmlCreator.createTable(newData, htmlContent);
        this._onDidChange.fire(previewUri);
    }
}