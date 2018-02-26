import * as vscode from 'vscode';
import { nfcall as promisifier } from './Filesystem';
import * as fs from 'fs';
import { previewUri, tableTag } from './consts';
import { Setting } from './setting';

export default class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {

    private callUpdate: any;
    private _html: string;
    private context: any;
    private _onDidChange: vscode.EventEmitter<vscode.Uri>;

    constructor(context) {
        this.context = context;
        this._html = null;
        this.callUpdate = null;
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
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
                let htmlPath = vscode.Uri.file(`${this.context.asAbsolutePath('src/content.html')}`);
                return promisifier(fs.readFile, htmlPath.fsPath, 'utf8').then((htmlContent: string) => {

                    this._html = htmlContent.replace('$$IMPORT_CSS_SCRIPTS$$', `<link rel="stylesheet" type="text/css" href="file://${this.context.asAbsolutePath('src/style.css')}">`)
                        .replace('$$IMPORT_JS_SCRIPTS$$', `<script src="file://${this.context.asAbsolutePath('out/gui.js')}"></script>`);
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

    update(newData: Setting[]) {
        const that = this;
        return this.html.then((html: string) => {
            const trChars = '</tr>';
            const insertAt = html.lastIndexOf(trChars) + trChars.length;

            const newTRs = newData.map(that.createTR.bind(that));
            this._html = this._html.slice(0, insertAt) + newTRs + this._html.slice(insertAt);
            this._onDidChange.fire(previewUri);
        });
    }

    createInitialTable(newData: Setting[]) {
        this.html.then(htmlContent => {
            this._html = htmlContent.replace(tableTag, this.createTable(newData));
            this._onDidChange.fire(previewUri);
        });
    }

    createTable(newData: Setting[]): string {
        // TODO: hardcoded
        var tableString = tableTag.replace('</table>', '');

        tableString += `<th><input class="select_all_checkbox" checked type="checkbox"></th><th>Sublime Setting</th><th>VSCode Setting</th>`

        for (let row of newData) {
            tableString += this.createTR(row);
        }

        tableString += "</table>";
        return tableString;
    }

    createTR(setting: Setting) {
        let tr = `<tr data-name='${setting.name}' data-value=${setting.value}>`;
        tr += this.createTD('<input class="setting_checkbox" type="checkbox"/>');
        tr += this.createTD(setting.name);
        tr += this.createTD(setting.value);
        tr += "</tr>";
        return tr;
    }

    createTD(val) {
        return `<td><span>${val}</span></td>`;
    }
}