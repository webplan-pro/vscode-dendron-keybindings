import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';
import { ISetting } from './settings';

export function importV3Settings(): void {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const versionThreeSettings = [
        { name: 'multiCursorModifier', value: 'ctrlCmd' },
        { name: 'snippetSuggestions', value: 'top' },
        { name: 'formatOnPaste', value: true },
    ];

    if (isDefaultValueSet(editorConfig, versionThreeSettings)) {
        versionThreeSettings.forEach((setting) => editorConfig.update(setting.name, setting.value, vscode.ConfigurationTarget.Global));
    }
}

function isDefaultValueSet(editorConfig: WorkspaceConfiguration, settings: ISetting[]): boolean {
    for (const setting of settings) {
        const info = editorConfig.inspect(setting.name);
        const defaultValue = info ? info.defaultValue : null;
        const globalValue = info ? info.globalValue : null;

        if (globalValue === defaultValue || globalValue === undefined) {
            return true;
        }
    }

    return false;
}
