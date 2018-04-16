import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { AnalyzedSettings, Mapper } from './mapper';
import { ISetting, MappedSetting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';
import * as path from 'path';

const mapper = new Mapper();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => importSettingsFromSublime()));

    const hasPrompted = context.globalState.get('alreadyPrompted') || false;
    if (!hasPrompted) {
        await showPrompt();
        await context.globalState.update('alreadyPrompted', true);
    }
}

async function showPrompt(): Promise<void> {
    const answer: string | undefined = await vscode.window.showInformationMessage('Would you like to customize VS Code to behave more like Sublime Text?', 'yes', 'no');
    if (answer && answer === 'yes') {
        importSettingsFromSublime();
    }
}

async function importSettingsFromSublime(): Promise<void> {
    const analyzedSettings = await getAnalyzedSettings();
    if (analyzedSettings) {
        if (analyzedSettings.mappedSettings.length) {
            const mappedSettings = await selectSettingsToImport(analyzedSettings);
            if (mappedSettings && mappedSettings.length) {
                await importSelectedSettings(mappedSettings);
            }
        } else {
            vscode.window.showInformationMessage('All settings imported.');
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
    return await browsePrompt(`No Sublime settings file found at the default location: ${path.join(sublimeFolderFinder.getOSDefaultPaths()[0], sublimeFolderFinder.sublimeSettingsFilename)}`);
}

async function browsePrompt(msg: string): Promise<string | undefined> {
    const result = await vscode.window.showInformationMessage(msg, 'Browse...');
    if (result) {
        const sublimeSettingsFiles = await vscode.window.showOpenDialog({ canSelectFiles: true });
        if (sublimeSettingsFiles && sublimeSettingsFiles.length) {
            const filePath = sublimeSettingsFiles[0].fsPath;
            const isValidFilePath = await validate(filePath);
            if (isValidFilePath) {
                return filePath;
            } else {
                vscode.window.showErrorMessage(`Could not find ${sublimeFolderFinder.sublimeSettingsFilename} at ${sublimeSettingsFiles[0].fsPath}`);
            }
        }
    }
    return undefined;
}

function validate(settingsFilePath: string): boolean {
    return settingsFilePath.endsWith(sublimeFolderFinder.sublimeSettingsFilename);
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

    return appendCustomizationSettings(settings);
}

function appendCustomizationSettings(settings: AnalyzedSettings): AnalyzedSettings {
    const customizationSettings: ISetting[] = [
        { name: 'editor.multiCursorModifier', value: 'ctrlCmd' },
        { name: 'editor.snippetSuggestions', value: 'top' },
        { name: 'editor.formatOnPaste', value: true },
    ];
    customizationSettings.forEach(setting => {
        if (settings.mappedSettings.find(mappedSetting => mappedSetting.vscode.name !== setting.name)) {
            settings.mappedSettings.push(new MappedSetting({ name: '', value: '' }, setting));
        }
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
        label: setting.sublime.name ? `${setting.sublime.name} $(arrow-right) setting.vscode.name` : setting.vscode.name,
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
        for (const setting of settings) {
            try {
                await config.update(setting.name, setting.value, vscode.ConfigurationTarget.Global);
                progress.report({ increment: incrementSize, message: setting.name });
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
                return;
            }
        }
    });
}
