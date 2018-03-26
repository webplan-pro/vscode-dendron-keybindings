import * as vscode from 'vscode';
import { HTMLCreator } from "./htmlCreation/htmlCreator";
import { Importer } from "./importer";
import { MappedSetting } from "./mappedSetting";
// import { ExtensionsImporter, MappedExtensionsAndThemes } from "./extensionImporter";
import { previewUri } from './consts';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import { CategorizedSettings } from './extension';


export class HTMLPreview {

    constructor(private importer: Importer, private htmlCreator: HTMLCreator, private provider: HTMLDocumentContentProvider) {}

    public async getSettingsAsync(settingsPath: vscode.Uri): Promise<MappedSetting[] | undefined> {
        const mappedSettings = await this.importer.getMappedSettingsAsync(settingsPath.fsPath);
        return mappedSettings;
    }

    public async showPage(categorizedSettings: CategorizedSettings, settings: vscode.Uri, isValid: boolean) {
        await this.htmlCreator.resetHTMLAsync();

        // create & display HTML Table
        await this.htmlCreator.onNewSettingsAsync(categorizedSettings, settings, isValid);
        this.provider.update();
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
