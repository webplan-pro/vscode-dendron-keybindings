import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { Mapper } from './mapper';
import { ISetting, MappedSetting, CategorizedSettings, VscodeSetting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';
import * as path from 'path';

const mapper = new Mapper();

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => start()));
    const hasPrompted = context.globalState.get('alreadyPrompted') || false;
    if (!hasPrompted) {
        await showPrompt();
        await context.globalState.update('alreadyPrompted', true);
    }
}

async function showPrompt(): Promise<void> {
    const answer: string | undefined = await vscode.window.showInformationMessage('Would you like to customize VS Code to behave more like Sublime Text?', 'yes', 'no');
    if (answer && answer === 'yes') {
        start();
    }
}

async function start(): Promise<void> {
    const categorizedSettings = await getCategorizedSettings();
    if (categorizedSettings) {
        if (categorizedSettings.mappedSettings.length) {    // TODO: Or default settings
            const selectedSettings = await showPicker(categorizedSettings);
            if (selectedSettings && selectedSettings.length) {
                await importSettings(selectedSettings);
                await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            }
        } else {
            vscode.window.showInformationMessage('All settings imported');
        }
    }
}

async function getCategorizedSettings(): Promise<CategorizedSettings | null> {
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
    return await browsePrompt(`No Sublime settings file found at the default location: ${path.join(sublimeFolderFinder.getOSDefaultPaths()[0], sublimeFolderFinder.sublimeSettingsFilename)} `);
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
                vscode.window.showErrorMessage(`Could not find ${sublimeFolderFinder.sublimeSettingsFilename} at ${sublimeSettingsFiles[0].fsPath} `);
            }
        }
    }
    return undefined;
}

function validate(settingsFilePath: string): boolean {
    return settingsFilePath.endsWith(sublimeFolderFinder.sublimeSettingsFilename);
}

async function getSettings(sublimeSettingsPath: string): Promise<CategorizedSettings> {
    const settings: CategorizedSettings | undefined = await mapper.getMappedSettings(await readFileAsync(sublimeSettingsPath, 'utf-8'));
    settings.mappedSettings.sort((a, b) => {
        if (a.vscode.overwritesValue && b.vscode.overwritesValue) {
            return a.sublime.name.localeCompare(b.sublime.name);
        } else if (a.vscode.overwritesValue) {
            return -1;
        } else if (b.vscode.overwritesValue) {
            return 1;
        }
        return a.sublime.name.localeCompare(b.sublime.name);
    });
    return settings;
}

async function showPicker(settings: CategorizedSettings): Promise<VscodeSetting[]> {
    const pickedItems = await vscode.window.showQuickPick([...settings.mappedSettings.map((ms) => settings2QuickPickItem(ms.vscode, ms.sublime.name)), ...settings.defaultSettings.map((def) => settings2QuickPickItem(def))], { canPickMany: true });
    if (pickedItems) {
        const mappedAndDefaultSettings: Array<VscodeSetting | MappedSetting> = [...settings.defaultSettings, ...settings.mappedSettings];
        return quickPickItemsToSettings(pickedItems, mappedAndDefaultSettings).map(setting => setting instanceof MappedSetting ? setting.vscode : setting);
    }
    return [];
}

function settings2QuickPickItem(vscodeSetting: VscodeSetting, sublimeName?: string): vscode.QuickPickItem {
    const icons = { exclamationPoint: '$(issue-opened)', arrowRight: '$(arrow-right)' };  // stored in var because auto-format adds spaces to hypens
    return {
        detail: vscodeSetting.overwritesValue
            ? `${icons.exclamationPoint} Overwrites existing value: '${vscodeSetting.oldValue}' with '${vscodeSetting.value}'`
            : '',
        label: sublimeName ? `${sublimeName} ${icons.arrowRight} ${vscodeSetting.name}` : `{Sublime Default} ${icons.arrowRight} ${vscodeSetting.name}: ${vscodeSetting.value}`,
        picked: !vscodeSetting.overwritesValue,
    };
}

function quickPickItemsToSettings(pickedItems: vscode.QuickPickItem[], settings: Array<VscodeSetting | MappedSetting>): Array<VscodeSetting | MappedSetting> {
    return settings.filter((setting) => pickedItems.find(name => {
        if (setting instanceof MappedSetting) {
            return settings2QuickPickItem(setting.vscode, setting.sublime.name).label === name.label;
        } else {
            return settings2QuickPickItem(setting).label === name.label;
        }
    }));
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
