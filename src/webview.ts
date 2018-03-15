import * as vscode from 'vscode';
import { HTMLCreator } from "./gui/htmlCreator";
import { Importer } from "./importer";
import { MappedSetting } from "./mappedSetting";
import { ExtensionsImporter, MappedExtensionsAndThemes } from "./extensionImporter";
import { SublimeFolders } from './sublimeFolderFinder';
import { previewUri } from './consts';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import { CategorizedSettings } from './extension';


export class Webview {

    constructor(private importer: Importer, private htmlCreator: HTMLCreator, private provider: HTMLDocumentContentProvider, private extensionsImporter: ExtensionsImporter) {}

    public async getSettingsAsync(settingsPath: vscode.Uri): Promise<MappedSetting[] | undefined> {
        const mappedSettings = await this.importer.getMatchingGlobalSettingsAsync(settingsPath.fsPath);
        return mappedSettings;
    }

    public async showPageWithDimmerAsync() {
        // create & display Dimmer to browse for sublime settings folder
        await this.htmlCreator.resetHTMLAsync();
        this.htmlCreator.addDimmer();
        this.provider.update();
        await this.showWebViewAsync();
    }

    public async showPage(categorizedSettings: CategorizedSettings, defaultSublimePaths: SublimeFolders) {
        await this.htmlCreator.resetHTMLAsync();

        // create & display HTML Table
        await this.htmlCreator.onNewSettingsAsync(categorizedSettings, defaultSublimePaths);

        // Get Packages & Themes
        const mappedExtAndThemes: MappedExtensionsAndThemes = await this.extensionsImporter.getExtensionsMappingAsync(defaultSublimePaths.main);
        this.htmlCreator.createPackagesList(mappedExtAndThemes.extensions, 'import-category-extensions');
        this.htmlCreator.createPackagesList(mappedExtAndThemes.themes, 'import-category-themes');
        this.provider.update();
        await this.showWebViewAsync();
    }

    private async showWebViewAsync(): Promise<{}> {
        return await vscode.commands.executeCommand(
            'vscode.previewHtml',
            previewUri,
            vscode.ViewColumn.Active,
            'Sublime Settings Importer'
        );
    }
}
