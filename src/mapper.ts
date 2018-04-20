import { resolve } from 'path';
import * as rjson from 'relaxed-json';
import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { ISetting, MappedSetting, CategorizedSettings } from './settings';

export class Mapper {

    private settingsMappings: Promise<{}> | undefined = undefined;

    constructor(settingsMappings?: Promise<{}>, private mockConfig?: any) {
        this.settingsMappings = settingsMappings;
    }

    public async getMappedSettings(sublimeSettings: string): Promise<CategorizedSettings> {
        const settingsMappings = await this.getSettingsMappings();
        return this.mapAllSettings(settingsMappings, rjson.parse(sublimeSettings));
    }

    private async getSettingsMappings(): Promise<{}> {
        if (!this.settingsMappings) {
            this.settingsMappings = readFileAsync(resolve(__dirname, '..', 'mappings/settings.json'), 'utf-8').then(rjson.parse);
        }
        return this.settingsMappings;

    }

    private mapAllSettings(mappedSettings: { [key: string]: any }, sublimeSettings: { [key: string]: any }): CategorizedSettings {
        const analyzedSettings: CategorizedSettings = new CategorizedSettings();
        const config = this.mockConfig || vscode.workspace.getConfiguration();

        for (const sublimeKey of Object.keys(sublimeSettings)) {
            const sublimeValue = sublimeSettings[sublimeKey];
            const vscodeSetting = this.mapSetting(sublimeKey, sublimeValue, mappedSettings[sublimeKey]);
            if (vscodeSetting) {
                const result = this.checkWithExistingSettings(vscodeSetting, config);
                const mappedSetting = new MappedSetting({ name: sublimeKey, value: sublimeValue }, vscodeSetting);

                if (result.keyValuePairExists) {
                    analyzedSettings.alreadyExisting.push(mappedSetting);   // setting with same key-value pair already exists
                } else {
                    if (result.overwritesValueWith) {
                        mappedSetting.markAsOverride(vscodeSetting.name, result.overwritesValueWith); // setting with same key but different value exists
                    }
                    analyzedSettings.mappedSettings.push(mappedSetting);
                }
            } else {
                analyzedSettings.noMappings.push({ name: sublimeKey, value: sublimeValue });
            }
        }
        return this.appendSublimeFeelSettings(analyzedSettings, config);
    }

    private checkWithExistingSettings(vscodeSetting: ISetting, config: vscode.WorkspaceConfiguration): { keyValuePairExists: boolean, overwritesValueWith: string } {
        const returnVal = { keyValuePairExists: false, overwritesValueWith: '' };
        const info = config.inspect(vscodeSetting.name);
        if (info && info.globalValue !== undefined) {
            if (info.globalValue === vscodeSetting.value) {
                returnVal.keyValuePairExists = true;
            } else {
                returnVal.overwritesValueWith = info.globalValue.toString();
            }
        }
        return returnVal;
    }

    private appendSublimeFeelSettings(settings: CategorizedSettings, config: vscode.WorkspaceConfiguration): CategorizedSettings {
        const emptySetting: ISetting = { name: '', value: '' };
        const sublimeFeelSettings: MappedSetting[] = [
            new MappedSetting(emptySetting, { name: 'editor.multiCursorModifier', value: 'ctrlCmd' }),
            new MappedSetting(emptySetting, { name: 'editor.snippetSuggestions', value: 'top' }),
            new MappedSetting(emptySetting, { name: 'editor.formatOnPaste', value: true }),
            new MappedSetting(emptySetting, { name: 'workbench.colorTheme', value: 'Monokai' }),
        ];

        // filter out settings that already exist in mapped or existing
        const mappedUnionExisting: MappedSetting[] = Array.from(new Set([...settings.mappedSettings, ...settings.alreadyExisting]));
        const uniqueFeelSettings = sublimeFeelSettings.filter(customizationSetting => mappedUnionExisting.find(mappedSetting => mappedSetting.vscode.name !== customizationSetting.vscode.name));
        // don't show settings that already exist in user config
        uniqueFeelSettings.forEach(feelSetting => {
            const info = config.inspect(feelSetting.vscode.name);
            if (info) {
                if (info.globalValue === undefined || info.globalValue !== feelSetting.vscode.value) {
                    settings.sublimeFeelSettings.push(feelSetting);
                }
            }
        });

        return settings;
    }

    private mapSetting(key: string, value: string, mappedValue: any): ISetting | undefined {
        if (mappedValue !== undefined) {
            if (typeof mappedValue === 'string') {
                return { name: mappedValue, value };
            } else if (typeof mappedValue === 'object') {
                const obj = mappedValue[value];
                if (!obj) {
                    vscode.window.showErrorMessage(`mapSetting() failed on key: ${key}, value: ${value}, mappedSetting: ${JSON.stringify(mappedValue)}`);
                    return undefined;
                }
                const keys = Object.keys(obj);
                const newKey = keys[0];
                const newValue = obj[newKey];
                return { name: newKey, value: newValue };
            }
        }

        return undefined;
    }
}
