import { Importer } from './importer';
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './TextDocumentContentProvider';
import { previewUri } from './consts';
import {Setting} from './setting';

const enum ProgressMessages {
    'started' = 'Sublime Settings imported has started',
    'launchingPreviewTable' = 'Launching preview table',
    'settingsImported' = 'Settings have been imported'
}

export function activate(context: vscode.ExtensionContext) {
    const importer: Importer = new Importer();
    const provider = new HTMLDocumentContentProvider(vscode.Uri.file(context.asAbsolutePath('')));

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.importFromSublime', async () => {
            // return vscode.commands.executeCommand(
            //     'workbench.extensions.action.showExtensionsWithId',
            //     'dbaeumer.jshint'
            // ).then(null, error => console.error(error));
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: ProgressMessages.started
            }, async (progress) => {

                // Get Settings
                const mappedSettings = await importer.getMatchingGlobalSettingsAsync();
                if (!mappedSettings || !mappedSettings.length) {
                    vscode.window.showInformationMessage(`No matching Sublime Text settings found.`);
                    return undefined;
                }

                progress.report({ message: ProgressMessages.settingsImported });

                // create & display HTML Table
                await provider.createInitialTableAsync(mappedSettings);
                
                progress.report({ message: ProgressMessages.launchingPreviewTable });

                return vscode.commands.executeCommand(
                    'vscode.previewHtml',
                    previewUri,
                    vscode.ViewColumn.Active,
                    'Sublime Settings Importer'
                ).then(null, error => console.error(error));
            });
        }),

        vscode.commands.registerCommand('extension.responseFromGUI', (setting: Setting) => {
            console.log('' + setting);
            if (setting.name && setting.value) {
                importer.updateSettingsAsync([new Setting(setting.name, setting.value)]);
            }
            else {
                console.error(`Unhandled message: ${setting}`);
            }
        }),

        vscode.workspace.registerTextDocumentContentProvider(previewUri.scheme, provider)
    ]);
}