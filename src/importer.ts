import * as fs from 'fs';
import * as path from 'path';
import * as rjson from 'relaxed-json';
import * as vscode from 'vscode';
import * as fileSystem from './fsWrapper';
import { MappedSetting, Setting } from './settings';

export class Importer {
    public static async initAsync(mappingsPath = path.resolve(__dirname, '..', 'mappings/settings.json')) {
        const data: string = await fileSystem.readFileAsync(mappingsPath, 'utf-8');
        return new Importer(data.toString());
    }

    private settingsMap: { [key: string]: string } = {};

    private constructor(data: string) {
        this.settingsMap = rjson.parse(data);
    }

    public async getMappedSettingsAsync(settingsPath: string): Promise<MappedSetting[] | undefined> {
        const settingsTxt: string = await fileSystem.promisifier<string>(fs.readFile, settingsPath, 'utf-8');
        return this.mapAllSettings(rjson.parse(settingsTxt));
    }

    public async updateSettingsAsync(settings: Setting[]): Promise<{}> {
        for (const setting of settings) {
            const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
            try {
                await config.update(setting.name, setting.value, vscode.ConfigurationTarget.Global);
            } catch (e) {
                console.error(e);
            }
        }

        return await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
    }

    private getExistingValue(setting: Setting): any | undefined {
        const config = vscode.workspace.getConfiguration();
        const info = config.inspect(setting.name);
        return info.globalValue === undefined ? undefined : info.globalValue;
    }

    private mapAllSettings(sublimeSettings): MappedSetting[] {
        const mappedSettings: MappedSetting[] = [];
        Object.keys(sublimeSettings).forEach((sublimeKey) => {
            const sublimeSetting = sublimeSettings[sublimeKey];
            const ms: MappedSetting = new MappedSetting(new Setting(sublimeKey, sublimeSetting));

            const vscodeMapping = this.mapSetting(sublimeKey, sublimeSetting);
            if (vscodeMapping) {
                ms.setVscode(vscodeMapping);
                const existingValue = this.getExistingValue(vscodeMapping);
                if (existingValue) {
                    ms.markAsDuplicate(new Setting(vscodeMapping.name, existingValue.toString()));
                }
            }
            mappedSettings.push(ms);
        });
        return mappedSettings;
    }

    private mapSetting(key: string, value: string): Setting | undefined {
        const mappedSetting: string | object = this.settingsMap[key];
        if (mappedSetting) {
            if (typeof mappedSetting === 'string') {
                return new Setting(mappedSetting, value);
            } else if (typeof mappedSetting === 'object') {
                const obj = mappedSetting[value];
                if (!obj) {
                    vscode.window.showErrorMessage(`mapSetting() failed on key: ${key}, value: ${value}, mappedSetting: ${JSON.stringify(mappedSetting)}`);
                    return undefined;
                }
                const keys = Object.keys(obj);
                const newKey = keys[0];
                const newValue = obj[newKey];
                return new Setting(newKey, newValue);
            }
        }

        return null;
    }
}
