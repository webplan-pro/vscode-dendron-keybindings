import { Importer } from './importer';
import * as vscode from 'vscode';
import HTMLDocumentContentProvider from './TextDocumentContentProvider';
import { previewUri } from './consts';

const enum ProgressMessages {
    'started' = 'Sublime Settings imported has started',
    'launchingPreviewTable' = 'Launching preview table',
    'settingsImported' = 'Settings have been imported'
}

export function activate(context: vscode.ExtensionContext) {
    const importer: Importer = new Importer();
    const provider: HTMLDocumentContentProvider = registerTxtDocumentProvider(context);

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.importFromSublime', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Window,
                title: ProgressMessages.started
            }, async (progress) => {
                startImportAsync(importer, provider, progress);
            })
        }),

        vscode.commands.registerCommand('extension.responseFromGUI', (setting: Setting) => {
            if (setting.name && setting.value) {
                importer.updateSettingsAsync([setting]);
            }
            else {
                console.error(`Unhandled message: ${setting}`);
            }
        })
    ]);
}

async function startImportAsync(importer, provider, progress): Promise<void> {
    const mappedSettings = await importer.getMatchingGlobalSettings();
    if (!mappedSettings || !mappedSettings.length) {
        vscode.window.showInformationMessage(`No matching Sublime Text settings found.`);
        return undefined;
    }

    progress.report({ message: ProgressMessages.settingsImported });
    await provider.createInitialTableAsync(mappedSettings);
    progress.report({ message: ProgressMessages.launchingPreviewTable });

    return vscode.commands.executeCommand(
        'vscode.previewHtml',
        previewUri,
        vscode.ViewColumn.Active,
        'Sublime Settings Importer'
    ).then(null, error => console.error(error));
}

function registerTxtDocumentProvider(context: vscode.ExtensionContext): HTMLDocumentContentProvider {
    const provider = new HTMLDocumentContentProvider(context);
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(
            previewUri.scheme,
            provider)
    );
    return provider;
}