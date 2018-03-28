import * as vscode from 'vscode';
import { HTMLCreator } from "./htmlCreation/htmlCreator";
import { Importer } from "./importer";
import { CategorizedSettings } from './extension';
import { JSDOM } from 'jsdom';
import { MappedSetting } from './settings';

export const scheme = 'vs-code-html-preview';
const previewUri = vscode.Uri.parse(`${scheme}://authority/vs-code-html-preview`);

export class HTMLPreview {

    readonly contentProvider: HTMLDocumentContentProvider;

    constructor(private importer: Importer, private htmlCreator: HTMLCreator) {
        this.contentProvider = new HTMLDocumentContentProvider(htmlCreator);
    }

    public async getSettingsAsync(settingsPath: vscode.Uri): Promise<MappedSetting[] | undefined> {
        const mappedSettings = await this.importer.getMappedSettingsAsync(settingsPath.fsPath);
        return mappedSettings;
    }

    public async showPage(categorizedSettings: CategorizedSettings, settings: vscode.Uri, isValid: boolean) {
        await this.htmlCreator.resetHTMLAsync();

        // create & display HTML Table
        await this.htmlCreator.onNewSettingsAsync(categorizedSettings, settings, isValid);
        this.contentProvider.update();
        await this.showAsync();
    }

    private async showAsync(): Promise<{}> {
        return await vscode.commands.executeCommand(
            'vscode.previewHtml',
            previewUri,
            vscode.ViewColumn.Active,
            'Sublime Settings Importer'
        );
    }
}

class HTMLDocumentContentProvider implements vscode.TextDocumentContentProvider {

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