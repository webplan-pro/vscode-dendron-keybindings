import * as rjson from 'relaxed-json';
import * as vscode from 'vscode';
import { MappedSetting, Setting } from './settings';

export class Importer {
    private settingsMappings: Map<string, any> = new Map();
    public constructor(mappings: string) {
        this.settingsMappings = this.json2Map(mappings);
    }

    public async getMappedSettingsAsync(sublimeSettings: string): Promise<MappedSetting[]> {
        return this.mapAllSettings(this.json2Map(sublimeSettings));
    }

    public async updateSettingsAsync(settings: Setting[]): Promise<void> {
        for (const setting of settings) {
            const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration();
            try {
                await config.update(setting.name, setting.value, vscode.ConfigurationTarget.Global);
            } catch (e) {
                console.error(e);
            }
        }
    }

    private json2Map(toParse: string): Map<string, any> {
        const map = new Map<string, any>();
        const parsed: any = rjson.parse(toParse);
        Object.keys(parsed).forEach(key => map.set(key, parsed[key]));
        return map;
    }

    private mapAllSettings(sublimeSettings: Map<string, any>): MappedSetting[] {
        const mappedSettings: MappedSetting[] = [];
        const config = vscode.workspace.getConfiguration();

        for (const [key, value] of sublimeSettings.entries()) {
            const mappedSetting: MappedSetting = new MappedSetting(new Setting(key, value));

            const vscodeMapping = this.mapSetting(key, value);
            if (vscodeMapping) {
                mappedSetting.setVscode(vscodeMapping);

                const info = config.inspect(vscodeMapping.name);
                if (info && info.globalValue) {
                    if (info.globalValue === vscodeMapping.value) {
                        continue;   // skip settings that already exist with the exact same value
                    }
                    mappedSetting.markAsDuplicate(new Setting(vscodeMapping.name, info.globalValue.toString()));
                }
            }
            mappedSettings.push(mappedSetting);
        }
        return mappedSettings;
    }

    private mapSetting(key: string, value: string): Setting | undefined {
        const mappedSetting: any = this.settingsMappings.get(key);
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

        return undefined;
    }
}
