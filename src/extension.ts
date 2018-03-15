import { Importer } from './importer';
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import { previewUri } from './consts';
import { Setting } from './setting';
import { HTMLCreator } from './gui/htmlCreator';
import { ExtensionsImporter, MappedExtensionsAndThemes } from './extensionImporter';
import { SublimeFolders } from './sublimeFolderFinder';

const enum ProgressMessages {
    'started' = 'Sublime Settings imported has started',
    'launchingPreviewTable' = 'Launching preview table',
    'settingsImported' = 'Settings have been imported'
}

const progressOptions = {
    location: vscode.ProgressLocation.Window,
    title: ProgressMessages.started
};

export async function activate(context: vscode.ExtensionContext) {
    const importer: Importer = new Importer();
    const htmlCreator: HTMLCreator = await HTMLCreator.initAsync(vscode.Uri.file(context.asAbsolutePath('')));
    const provider = new HTMLDocumentContentProvider(htmlCreator);
    const extensionsImporter = new ExtensionsImporter();
    let numStarted = 0;

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.importFromSublime', async () => {
            await vscode.window.withProgress(progressOptions, async (progress) => {

                // prevent duplicate HTML content when command is executed several times
                if (numStarted++ > 0) {
                    await htmlCreator.resetHTML();
                }

                const sublimeFolder: SublimeFolders | undefined = await importer.getSublimeSettingsFolderAsync();
                if (!sublimeFolder) {
                    return undefined;
                }

                // Get Settings
                const mappedSettings = await importer.getMatchingGlobalSettingsAsync(sublimeFolder.settings.fsPath);
                if (!mappedSettings || !mappedSettings.length) {
                    vscode.window.showInformationMessage(`No matching Sublime Text settings found.`);
                    return undefined;
                }

                progress.report({ message: ProgressMessages.settingsImported });

                // create & display HTML Table
                await htmlCreator.onNewSettingsAsync(mappedSettings);

                // Get Packages & Themes
                const mappedExtAndThemes: MappedExtensionsAndThemes = await extensionsImporter.getExtensionsMappingAsync(sublimeFolder.main);
                htmlCreator.createPackagesList(mappedExtAndThemes.extensions, 'import-category-extensions');
                htmlCreator.createPackagesList(mappedExtAndThemes.themes, 'import-category-themes');

                provider.update();

                progress.report({ message: ProgressMessages.launchingPreviewTable });

                await vscode.commands.executeCommand(
                    'vscode.previewHtml',
                    previewUri,
                    vscode.ViewColumn.Active,
                    'Sublime Settings Importer'
                );
            });
        }),

        vscode.commands.registerCommand('extension.responseFromGUI', (setting: Setting) => {
            if (setting && setting.name && setting.value) {
                importer.updateSettingsAsync([new Setting(setting.name, setting.value)]);
            }
            else {
                console.error(`Unhandled message: ${setting}`);
            }
        }),

        vscode.workspace.registerTextDocumentContentProvider(previewUri.scheme, provider)
    ]);
}