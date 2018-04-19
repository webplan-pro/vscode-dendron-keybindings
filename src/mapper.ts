import { resolve } from 'path';
import * as rjson from 'relaxed-json';
import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { ISetting, MappedSetting } from './settings';

export class CategorizedSettings {
    public mappedSettings: MappedSetting[] = [];
    public alreadyExisting: MappedSetting[] = [];
    public noMappings: ISetting[] = [];
    public sublimeFeelSettings: MappedSetting[] = [];   // settings that are not in the mappings file but improve the sublime feel & look in VS Code
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

        for (const key of Object.keys(sublimeSettings)) {
            const value = sublimeSettings[key];
            const vscodeMapping = this.mapSetting(key, value, mappedSettings[key]);
            if (vscodeMapping) {
                const mappedSetting: MappedSetting = new MappedSetting({ name: key, value });
                mappedSetting.setVscode(vscodeMapping);

                const info = config.inspect(vscodeMapping.name);
                if (info && info.globalValue !== undefined) {
                    if (info.globalValue === vscodeMapping.value) {
                        analyzedSettings.alreadyExisting.push(mappedSetting);
                        continue;
                    }
                    mappedSetting.markAsDuplicate({ name: vscodeMapping.name, value: info.globalValue.toString() });
                }
                analyzedSettings.mappedSettings.push(mappedSetting);
            } else {
                analyzedSettings.noMappings.push({ name: key, value });
            }
        }
        return this.appendSublimeFeelSettings(analyzedSettings, config);
    }

    private appendSublimeFeelSettings(settings: CategorizedSettings, config: vscode.WorkspaceConfiguration): CategorizedSettings {
        const sublimeFeelSettings: MappedSetting[] = [
            new MappedSetting({ name: '', value: '' }, { name: 'editor.multiCursorModifier', value: 'ctrlCmd' }),
            new MappedSetting({ name: '', value: '' }, { name: 'editor.snippetSuggestions', value: 'top' }),
            new MappedSetting({ name: '', value: '' }, { name: 'editor.formatOnPaste', value: true }),
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
