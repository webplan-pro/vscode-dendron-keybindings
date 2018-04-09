import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { AnalyzedSettings, Mapper } from './mapper';
import { ISetting, MappedSetting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';

const mapper = new Mapper();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublimePicker', () => importSettingsFromSublime()));
}

async function importSettingsFromSublime(): Promise<void> {
    const analyzedSettings = await getAnalyzedSettings();
    if (analyzedSettings) {
        const mappedSettings = await selectSettingsToImport(analyzedSettings);
        if (mappedSettings && mappedSettings.length) {
            await importSelectedSettings(mappedSettings);
        }
    }
}

async function getAnalyzedSettings(): Promise<AnalyzedSettings | null> {
    const settingsPath = await getSublimeFolderPath();
    if (settingsPath) {
        return getSettings(settingsPath);
    }
    return null;
}

async function getSublimeFolderPath(): Promise<string | undefined> {
    const sublimeSettingsPath = await sublimeFolderFinder.getExistingDefaultPaths();
    if (sublimeSettingsPath) {
        return sublimeSettingsPath.fsPath;
    }
    return await pickSublimeSettingsPath();
}

async function pickSublimeSettingsPath(): Promise<string | undefined> {
    const result = await vscode.window.showInformationMessage('Pick your Sublime settings folder', 'Browse...');
    if (result) {
        const sublimeSettingsFilePaths = await vscode.window.showOpenDialog({ canSelectFiles: true });
        if (sublimeSettingsFilePaths && sublimeSettingsFilePaths.length) {
            const validationResult = await validatePath(sublimeSettingsFilePaths[0].fsPath);
            if (!validationResult) {
                return sublimeSettingsFilePaths[0].fsPath;
            }
        }
    }
    return undefined;
}

async function validatePath(path: string): Promise<string> {
    return path ? '' : 'path should not be empty';
}

async function getSettings(sublimeSettingsPath: string): Promise<AnalyzedSettings> {
    const settings: AnalyzedSettings | undefined = await mapper.getMappedSettings(await readFileAsync(sublimeSettingsPath, 'utf-8'));
    settings.mappedSettings.sort((a, b) => {
        if (a.isDuplicate && b.isDuplicate) {
            return a.sublime.name.localeCompare(b.sublime.name);
        } else if (a.isDuplicate) {
            return -1;
        } else if (b.isDuplicate) {
            return 1;
        }
        return a.sublime.name.localeCompare(b.sublime.name);
    });
    return settings;
}

async function selectSettingsToImport(settings: AnalyzedSettings): Promise<MappedSetting[]> {
    const pickedSettingNames: vscode.QuickPickItem[] | undefined = await vscode.window.showQuickPick(settings.mappedSettings
        .map(setting2QuickPickItem), { canPickMany: true });
    if (pickedSettingNames) {
        return pickedSettingNames
            .map(name => settings.mappedSettings
                .find(setting => setting2QuickPickItem(setting).label === name.label)) as MappedSetting[];
    }
    return [];
}

function setting2QuickPickItem(setting: MappedSetting): vscode.QuickPickItem {
    return {
        detail: setting.isDuplicate
            ? `$(issue-opened) Overwrites existing value: ${setting.duplicateVscodeSetting && setting.duplicateVscodeSetting.value}`
            : '',
        label: `${setting.sublime.name} $(arrow-right) ${setting.vscode.name}`,
        picked: !setting.isDuplicate,
    };
}

async function importSelectedSettings(selectedSettings: MappedSetting[]): Promise<void> {
    await importSettings(selectedSettings.map(selSettings => selSettings.vscode));
    await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
}

async function importSettings(settings: ISetting[]): Promise<void> {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Importing Settings',
    }, async (progress) => {
        progress.report({ increment: 0 });
        const incrementSize = 100.0 / settings.length;
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
        await Promise.all(settings.map(async setting => {
            await config.update(setting.name, setting.value, vscode.ConfigurationTarget.Global);
            progress.report({ increment: incrementSize, message: setting.name });
        }));
    });
}
