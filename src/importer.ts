import * as fs from "fs";
import * as path from "path";
import * as rjson from "relaxed-json";
import * as vscode from "vscode";
import * as fileSystem from "./Filesystem";
import { MappedSetting } from "./mappedSetting";
import { Setting } from "./setting";
import * as sublimeFolderFinder from "./sublimeFolderFinder";
import { SublimeFolders } from "./sublimeFolderFinder";

export class Importer {
    private settingsMap: { [key: string]: string } = {};

    constructor() {
        this.readSettingsMapAsync().then((settings) => {
            this.settingsMap = settings;
        });
    }

    public async getSublimeSettingsFolderAsync(): Promise<SublimeFolders | undefined> {
        const sublimeFolder: SublimeFolders = await this.showFolderQuickPick();
        return sublimeFolder || undefined;
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

    public async updateSettingsAsync(settings: Setting[]) {
        for (const setting of settings) {
            const { namespace, settingName } = setting.getNamespaceAndSettingName();
            const config = vscode.workspace.getConfiguration(namespace);
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

    private async showFolderQuickPick(): Promise<SublimeFolders | undefined> {
        const browseOption = 'Browse...';
        const defaultPaths: SublimeFolders[] = await sublimeFolderFinder.getExistingDefaultPaths();
        const pick = await vscode.window.showQuickPick([...defaultPaths.map(p => p.main.fsPath), browseOption],
            { 'placeHolder': `Select your Sublime-Text Settings folder from the list or click on ${browseOption}` });
        if (!pick) {
            return undefined;
        } else if (pick === browseOption) {
            const folder = await this.folderPicker();
            return folder;
        } else {
            return defaultPaths.find(item => item.main.fsPath === pick);
        }
    }

    private async folderPicker(): Promise<sublimeFolderFinder.SublimeFolders | undefined> {
        const [folderPath] = [] = await vscode.window.showOpenDialog({ canSelectFolders: true });
        if (!folderPath) {
            return undefined;
        }
        const paths: sublimeFolderFinder.SublimeFolders[] = await sublimeFolderFinder.filterForExistingDirsAsync([folderPath.fsPath]);
        if (!paths.length) {
            vscode.window.showErrorMessage(`${folderPath.fsPath} is not a Sublime-Text Settings folder`);
            return undefined;
        }
        return paths[0];
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
                const newKey = Object.keys(obj)[0];
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
