import { Importer } from './importer';
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './HTMLDocumentContentProvider';
import { previewUri } from './consts';
import { Setting } from './setting';
import { HTMLCreator } from './gui/htmlCreator';
import * as sublimeFolderFinder from './sublimeFolderFinder';
import { SublimeFolders } from './sublimeFolderFinder';
import { HTMLPreview } from './htmlPreview';
import { MappedSetting } from './mappedSetting';


interface ISettingsPacket {
    data: Setting[]
}

export class CategorizedSettings {
    mapped: MappedSetting[] = [];
    unmapped: MappedSetting[] = [];
}

export async function activate(context: vscode.ExtensionContext) {
    const importer: Importer = await Importer.initAsync();
    const htmlCreator: HTMLCreator = await HTMLCreator.initializeAsync(vscode.Uri.file(context.asAbsolutePath('')));
    const provider = new HTMLDocumentContentProvider(htmlCreator);
    const webview = new HTMLPreview(importer, htmlCreator, provider);

    let numStarted = 0;

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.importFromSublime', async () => {
            // prevent duplicate HTML content when command is executed several times
            if (numStarted++ > 0) {
                await htmlCreator.resetHTMLAsync();
            }

            const defaultSublimePaths: SublimeFolders[] = await sublimeFolderFinder.getExistingDefaultPaths();
            if (!defaultSublimePaths || !defaultSublimePaths.length) {
                const osDefaultPaths: string[] = sublimeFolderFinder.getOSDefaultPaths();
                await webview.showPageWithDimmerAsync(osDefaultPaths);
            } else {
                await getSettingsAndShowPage(webview, defaultSublimePaths[0]);
            }
        }),

        vscode.commands.registerCommand('extension.selectedSettingsFromGUI', (packet: ISettingsPacket) => {
            if (packet.data) {
                const settings: Setting[] = packet.data.map(setting => new Setting(setting.name, setting.value));
                importer.updateSettingsAsync(settings);
            }
            else {
                console.error(`Unhandled message: ${JSON.stringify(packet.data)}`);
            }
        }),

        vscode.commands.registerCommand('extension.userClickedOnBrowseButtonFromGUI', async () => {
            const folderPickerResult: sublimeFolderFinder.IFolderPickerResult = await sublimeFolderFinder.folderPicker();
            if (folderPickerResult.notFound || folderPickerResult.cancelled && !htmlCreator.isValidSublimeSettingsPathSet()) {
                const osDefaultPaths: string[] = sublimeFolderFinder.getOSDefaultPaths();
                await webview.showPageWithDimmerAsync(osDefaultPaths);
                return undefined;
            } 
            else {
                getSettingsAndShowPage(webview, folderPickerResult.sublimeFolders);
            }
        }),

        vscode.workspace.registerTextDocumentContentProvider(previewUri.scheme, provider)
    ]);
}

async function getSettingsAndShowPage(webview: HTMLPreview, sublimeFolder: SublimeFolders) {
    const mappedSettings: MappedSetting[] | undefined = await webview.getSettingsAsync(sublimeFolder.settings);
    if (!mappedSettings || !mappedSettings.length) {
        vscode.window.showInformationMessage(`No matching Sublime Text settings found.`);
        const osDefaultPaths: string[] = sublimeFolderFinder.getOSDefaultPaths();
        await webview.showPageWithDimmerAsync(osDefaultPaths);
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

