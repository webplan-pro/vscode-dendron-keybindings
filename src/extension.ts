import { Importer } from './importer';
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import { previewUri } from './consts';
import { Setting } from './setting';
import { HTMLCreator } from './gui/htmlCreator';
import { ExtensionsImporter } from './extensionImporter';
import * as sublimeFolderFinder from './sublimeFolderFinder';
import { SublimeFolders } from './sublimeFolderFinder';
import { Webview } from './webview';
import { MappedSetting } from './mappedSetting';

const enum ProgressMessages {
    'started' = 'Sublime Settings imported has started',
    'launchingPreviewTable' = 'Launching preview table',
    'settingsImported' = 'Settings have been imported'
}

const progressOptions = {
    location: vscode.ProgressLocation.Window,
    title: ProgressMessages.started
};

export interface SelectedSettings {
    settings: Setting[], 
    showUserSettingsEditor: boolean
}

export class CategorizedSettings {
    mapped: MappedSetting[] = [];
    unmapped: MappedSetting[] = [];
}

export async function activate(context: vscode.ExtensionContext) {
    const importer: Importer = new Importer();
    const htmlCreator: HTMLCreator = await HTMLCreator.initializeAsync(vscode.Uri.file(context.asAbsolutePath('')));
    const provider = new HTMLDocumentContentProvider(htmlCreator);
    const extensionsImporter = new ExtensionsImporter();
    const webview = new Webview(importer, htmlCreator, provider, extensionsImporter);

    let numStarted = 0;

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.importFromSublime', async () => {
            // sublime setting someValue
            // vscode setting to be false <--
            // "editor.matchBrackets": "true",
            // const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('editor');
            // await config.update('matchBrackets', false, vscode.ConfigurationTarget.Global);
                
            await vscode.window.withProgress(progressOptions, async (progress) => {

                // prevent duplicate HTML content when command is executed several times
                if (numStarted++ > 0) {
                    await htmlCreator.resetHTMLAsync();
                }

                const defaultSublimePaths: SublimeFolders[] | undefined = await sublimeFolderFinder.getExistingDefaultPaths();
                if (!defaultSublimePaths || !defaultSublimePaths.length) {
                    await webview.showPageWithDimmerAsync();
                } else {
                    await getSettingsAndShowPage(webview, defaultSublimePaths[0]);
                }

                progress.report({ message: ProgressMessages.launchingPreviewTable });
            });
        }),

        vscode.commands.registerCommand('extension.selectedSettingsFromGUI', (settings: SelectedSettings) => {
            if (settings && settings.settings) {
                settings.settings = settings.settings.map(setting => new Setting(setting.name, setting.value)); // FIMXE: ugly 
                importer.updateSettingsAsync(settings);
            }
            else {
                console.error(`Unhandled message: ${JSON.stringify(settings)}`);
            }
        }),

        vscode.commands.registerCommand('extension.userClickedOnBrowseButtonFromGUI', async () => {
            const sublimeFolders: SublimeFolders | undefined = await sublimeFolderFinder.folderPicker();
            if (!sublimeFolders) {
                await webview.showPageWithDimmerAsync();
                return undefined;
            } else {
                getSettingsAndShowPage(webview, sublimeFolders);
            }
        }),

        vscode.workspace.registerTextDocumentContentProvider(previewUri.scheme, provider)
    ]);
}

async function getSettingsAndShowPage(webview: Webview, sublimeFolder: SublimeFolders) {
    const mappedSettings: MappedSetting[] | undefined = await webview.getSettingsAsync(sublimeFolder.settings);
    if (!mappedSettings || !mappedSettings.length) {
        vscode.window.showInformationMessage(`No matching Sublime Text settings found.`);
        return await webview.showPageWithDimmerAsync();
    }

    return await webview.showPage(categorizeAndSortSettings(mappedSettings), sublimeFolder);
}

function categorizeAndSortSettings(settings: MappedSetting[]): CategorizedSettings {
    const categorized: CategorizedSettings = settings.reduce((prev, curr) => {
        if (MappedSetting.hasNoMatch(curr)) {
            prev.unmapped.push(curr);
        } else {
            prev.mapped.push(curr);
        }
        return prev;
    }, new CategorizedSettings());

    categorized.mapped.sort((a, b) => {
        if (a.isDuplicate && b.isDuplicate) {
            return a.sublime.name.localeCompare(b.sublime.name);
        } else if (a.isDuplicate) {
            return -1;
        } else if (b.isDuplicate) {
            return 1;
        }
        return a.sublime.name.localeCompare(b.sublime.name)
    });
    categorized.unmapped.sort((a, b) => a.sublime.name.localeCompare(b.sublime.name));

    return categorized;
}

