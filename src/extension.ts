import { Importer } from './importer';
import * as vscode from 'vscode';
import { Start } from './start';
import { previewUri, tableTag } from './consts';
import HTMLDocumentContentProvider from './TextDocumentContentProvider';

export function activate(context: vscode.ExtensionContext) {
    const importer: Importer = new Importer();
    const provider: HTMLDocumentContentProvider = registerTxtDocumentProvider(context);
    const extension = new Start(importer, provider);


    context.subscriptions.push(...[
        vscode.commands.registerCommand('extension.importFromSublime', () => {
            return extension.start().then(() => {
                vscode.commands.executeCommand(
                    'vscode.previewHtml',
                    previewUri,
                    vscode.ViewColumn.Two,
                    'Sublime Settings Importer'
                ).then(null, error => console.error(error));
            });
        }),
        vscode.commands.registerCommand('extension.getResponseFromGUI', (setting: Setting) => {
            console.log('Received:', setting);

            if (setting.name && setting.value) {
                importer.updateSettings([setting]);
                provider.update([setting]);
            }
            else {
                console.error(`Unhandled message: ${setting}`);
            }

        })
    ]);
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