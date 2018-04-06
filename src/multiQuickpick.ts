import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { Importer } from './importer';
import { MappedSetting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';

export class MultiQuickpick {

    private browseLabel: string = 'Browse...';
    constructor(context: vscode.ExtensionContext, private importer: Importer) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublimePicker', () => this.openAsync()));
    }

    private async openAsync(sublimeSettingsPath?: vscode.Uri): Promise<void> {
        sublimeSettingsPath = sublimeSettingsPath || await sublimeFolderFinder.getExistingDefaultPaths();
        if (!sublimeSettingsPath) {
            return this.showBrowseButtonAsync({
                label: this.browseLabel,
                description: '$(issue-opened) No Sublime settings folder found. It\'s usually located here:',
                detail: sublimeFolderFinder.getOSDefaultPaths().join(' '),
            });
        }

        const mappedSettings: MappedSetting[] = await this.getSettingsAsync(sublimeSettingsPath.fsPath);
        if (!mappedSettings.length) {
            return await this.showBrowseButtonAsync({
                label: this.browseLabel,
                description: '$(issue-opened) No new settings to import from:',
                detail: sublimeSettingsPath.fsPath,
            });
        }

        const pickedSettingNames: vscode.QuickPickItem[] | undefined = await vscode.window.showQuickPick(mappedSettings
            .map(this.setting2QuickPickItem), { canPickMany: true });
        if (pickedSettingNames) {
            const selSettings = pickedSettingNames.map(name => mappedSettings.find(set => this.setting2QuickPickItem(set).label === name.label)) as MappedSetting[];
            this.importSelectedSettingsAsync(selSettings);
        }
    }

    private async showBrowseButtonAsync(msgItem: vscode.QuickPickItem): Promise<void> {
        const browse: vscode.QuickPickItem | undefined = await vscode.window.showQuickPick([msgItem]);
        if (browse) {
            this.pickFolderAsync();
        }
    }

    private setting2QuickPickItem(setting: MappedSetting): vscode.QuickPickItem {
        return {
            detail: setting.isDuplicate
                ? `$(issue-opened) Overwrites existing value: ${setting.duplicateVscodeSetting && setting.duplicateVscodeSetting.value}`
                : '',
            label: `${setting.sublime.name} $(arrow-right) ${setting.vscode.name}`,
            picked: !setting.isDuplicate,
        };
    }
    private async pickFolderAsync(): Promise<void> {
        const sublimeSettingsPath: vscode.Uri | undefined = await sublimeFolderFinder.pickSublimeSettings();
        if (sublimeSettingsPath) {
            this.openAsync(sublimeSettingsPath);
        } else {
            await this.showBrowseButtonAsync({
                label: this.browseLabel,
                description: '$(issue-opened) Invalid Sublime settings path',
                detail: 'Note that the settings path is different from the installation path',
            });
        }
    }

    private async importSelectedSettingsAsync(selectedSettings: MappedSetting[]): Promise<void> {
        if (selectedSettings.length) {
            await this.importer.updateSettingsAsync(selectedSettings.map(selSettings => selSettings.vscode));
            await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        }
    }

    private async getSettingsAsync(sublimeSettingsPath: string): Promise<MappedSetting[]> {
        const importer = await this.importer;
        let settings: MappedSetting[] | undefined = await importer.getMappedSettingsAsync(await readFileAsync(sublimeSettingsPath, 'utf-8'));
        settings = settings.filter((s) => !MappedSetting.hasNoMatch(s));
        settings.sort((a, b) => {
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
}
