import * as vscode from 'vscode';
import { nfcall as promisifier } from './Filesystem';
import * as fs from 'fs';
import { previewUri } from './consts';
import { Setting } from './setting';
import { MappedSetting } from './importer';
import {HTMLCreator} from './gui/htmlCreator'


export default class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {

    private callUpdate: any;
    private _html: string;
    private context: any;
    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private htmlCreator: HTMLCreator;

    constructor(context) {
        this.context = context;
        this._html = null;
        this.callUpdate = null;
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this.htmlCreator = new HTMLCreator();
    }

    provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        return this.html;
    }

    get html() {
        return new Promise((resolve, reject) => {
            if (this._html) {
                resolve(this._html);
                return;
            } else {
                let htmlPath = vscode.Uri.file(`${this.context.asAbsolutePath('resources/content.html')}`);
                return promisifier(fs.readFile, htmlPath.fsPath, 'utf8').then((htmlContent: string) => {

                    this._html = this.htmlCreator.replaceInitialHTML(htmlContent, this.context);
                    resolve(this._html);
                })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    });
            }
        }).catch(e => e);   // TODO: error is shown in GUI
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

    createInitialTableAsync(newData: MappedSetting[]) {
        this.html.then(htmlContent => {
            this._html = htmlContent.replace('</table>', this.htmlCreator.createTable(newData));
            this._onDidChange.fire(previewUri);
        });
    }
}