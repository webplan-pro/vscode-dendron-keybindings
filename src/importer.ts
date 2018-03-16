import * as fs from "fs";
import * as path from "path";
import * as rjson from "relaxed-json";
import * as vscode from "vscode";
import * as fileSystem from "./Filesystem";
import { MappedSetting } from "./mappedSetting";
import { Setting } from "./setting";
import { SelectedSettings } from "./extension";

export class Importer {
    private settingsMap: { [key: string]: string } = {};

    constructor() {
        this.readSettingsMapAsync().then((settings) => {
            this.settingsMap = settings;
        });
    }

    public async getMatchingGlobalSettingsAsync(sublimePath: string): Promise<MappedSetting[] | undefined> {
        const mappedSettings: MappedSetting[] = await this.getMappedSettings(sublimePath);
        return mappedSettings;
    }

    public async getMappedSettings(settingsPath: string): Promise<MappedSetting[] | undefined> {
        const data = await fileSystem.promisifier(fs.readFile, settingsPath);
        const globalSettings = rjson.parse(data.toString());
        const mappedGlobalSettings = this.mapAllSettings(globalSettings);
        return mappedGlobalSettings;
    }

    public async updateSettingsAsync(settings: SelectedSettings): Promise<{} | undefined> {
        for (const setting of settings.settings) {
            const { namespace, settingName } = setting.getNamespaceAndSettingName();
            const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(namespace);
            if (config && settingName) {
                try {
                    await config.update(settingName, setting.value, vscode.ConfigurationTarget.Global);
                } catch (e) {
                    console.error(e);
                }
            } else {
                console.error('getConfiguration failed for namespace: ${namespace}')
            }
        }

        if (settings.showUserSettingsEditor) {
            return await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        }

        return undefined;
    }

    private getExistingVscodeSetting(setting: Setting): {} | undefined {
        const { namespace, settingName } = setting.getNamespaceAndSettingName();
        const config = vscode.workspace.getConfiguration(namespace);
        if (config && settingName) {
            const info = config.inspect(settingName);
            if (info.globalValue && info.globalValue !== undefined) {
                return info.globalValue;
            }
            return undefined;
        } else {
            console.error('getConfiguration failed for namespace: ${namespace}')
            return undefined;
        }
    }

    private mapAllSettings(sublimeSettings): MappedSetting[] {
        const mappedSettings: MappedSetting[] = [];
        for (const sublimeKey in sublimeSettings) {
            const sublimeSetting = sublimeSettings[sublimeKey]
            const ms: MappedSetting = new MappedSetting(new Setting(sublimeKey, sublimeSetting));

            const vscodeMapping = this.mapSetting(sublimeKey, sublimeSetting)
            if (vscodeMapping) {
                ms.setVscode(vscodeMapping);
                const existingValue = this.getExistingVscodeSetting(vscodeMapping);
                if (existingValue) {
                    ms.markAsDuplicate(new Setting(vscodeMapping.name, existingValue.toString()));
                }
            }

            mappedSettings.push(ms);
        }
        return mappedSettings
    }

    private mapSetting(key: string, value: string): Setting {
        let mappedSetting: string | object = this.settingsMap[key];
        if (mappedSetting) {
            if (typeof mappedSetting === 'string') {
                return new Setting(mappedSetting, value);
            }
            else if (typeof mappedSetting === 'object') {
                const obj = mappedSetting[value];
                if (!obj) {
                    throw new ReferenceError(`mapSetting() failed on key: ${key}, value: ${value}, mappedSetting: ${JSON.stringify(mappedSetting)}`);
                }
                const keys = Object.keys(obj);
                const newKey = keys[0];
                const newValue = obj[newKey];
                return new Setting(newKey, newValue);
            }
        }

        return null
    }

    private async readSettingsMapAsync(): Promise<{ [key: string]: string }> {
        const mapPath = path.resolve(__dirname, "..", "mappings/settings.json");
        const data: string = await fileSystem.readFileAsync(mapPath, 'utf-8');
        return rjson.parse(data.toString());
    }
}
