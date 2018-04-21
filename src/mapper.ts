import { resolve } from 'path';
import * as rjson from 'relaxed-json';
import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { ISetting, MappedSetting, CategorizedSettings, VscodeSetting } from './settings';

interface IConfigCheck {
    /** Key-Value pair already exists in user settings */
    readonly alreadyExists: boolean;
    /** Setting already exists in user settings but with a different value */
    readonly existingValue: string;
}

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
            const sublimeSetting = { name: sublimeKey, value: sublimeSettings[sublimeKey] };
            const vscodeSetting = this.mapSetting(sublimeSetting, mappedSettings[sublimeKey]);
            if (vscodeSetting) {
                const configTest = this.checkWithExistingSettings(vscodeSetting, config);
                const mappedSetting = new MappedSetting(sublimeSetting, vscodeSetting);

                if (configTest.alreadyExists) {
                    analyzedSettings.alreadyExisting.push(mappedSetting);   // setting with same key-value pair already exists
                } else {
                    if (configTest.existingValue) {
                        mappedSetting.vscode.markAsOverride(configTest.existingValue); // setting with same key but different value exists
                    }
                    analyzedSettings.mappedSettings.push(mappedSetting);
                }
            } else {
                analyzedSettings.noMappings.push(sublimeSetting);
            }
        }
        return this.appendDefaultSublimeSettings(analyzedSettings, config);
    }

    private checkWithExistingSettings(vscodeSetting: VscodeSetting, config: vscode.WorkspaceConfiguration): IConfigCheck {
        const returnVal = { alreadyExists: false, existingValue: '' };
        const info = config.inspect(vscodeSetting.name);
        if (info && info.globalValue !== undefined) {
            if (info.globalValue === vscodeSetting.value) {
                returnVal.alreadyExists = true;
            } else {
                returnVal.existingValue = info.globalValue.toString();
            }
        }
        return returnVal;
    }

    private appendDefaultSublimeSettings(settings: CategorizedSettings, config: vscode.WorkspaceConfiguration): CategorizedSettings {
        const defaultSettings: VscodeSetting[] = [
            new VscodeSetting('editor.multiCursorModifier', 'ctrlCmd'),
            new VscodeSetting('editor.snippetSuggestions', 'top'),
            new VscodeSetting('editor.formatOnPaste', true),
            new VscodeSetting('workbench.colorTheme', 'Monokai'),
        ];

        // get unique settings from mapped & alreadyExisting
        const uniqueMappedExisting: MappedSetting[] = Array.from(new Set([...settings.mappedSettings, ...settings.alreadyExisting]));
        const uniqueDefaultSettings = defaultSettings.filter(defaultSetting => uniqueMappedExisting.find(mappedSetting => mappedSetting.vscode.name !== defaultSetting.name));
        // don't show settings that already exist in user config

        uniqueDefaultSettings.forEach(defaultSetting => {
            const configTest = this.checkWithExistingSettings(defaultSetting, config);

            if (configTest.alreadyExists) {
                settings.alreadyExisting.push(new MappedSetting({ name: 'Default Setting', value: '' }, defaultSetting));
            } else {
                if (configTest.existingValue) {
                    defaultSetting.markAsOverride(configTest.existingValue);
                }
                settings.defaultSettings.push(defaultSetting);
            }
        });

        return settings;
    }

    private mapSetting(sublimeSetting: ISetting, mappedValue: any): VscodeSetting | undefined {
        if (mappedValue !== undefined) {
            if (typeof mappedValue === 'string') {
                return new VscodeSetting(mappedValue, sublimeSetting.value);
            } else if (typeof mappedValue === 'object') {
                const obj = mappedValue[sublimeSetting.value];
                if (!obj) {
                    vscode.window.showErrorMessage(`mapSetting() failed on setting: ${JSON.stringify(sublimeSetting)}, mappedSetting: ${JSON.stringify(mappedValue)}`);
                    return undefined;
                }
                const keys = Object.keys(obj);
                const newKey = keys[0];
                const newValue = obj[newKey];
                return new VscodeSetting(newKey, newValue);
            }
        }

        return undefined;
    }
}
