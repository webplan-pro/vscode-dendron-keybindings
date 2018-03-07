import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import * as rjson from 'relaxed-json';
import { nfcall as promisifier } from './Filesystem';

import { Setting } from './setting';
import * as sublimeFolderFinder from './sublimeFolderFinder';

export class MappedSetting {
    public sublime: Setting;
    public vscode: Setting;
    private static readonly NO_MATCH: string = '--No Match--';

    constructor(sublime: Setting, vscode?: Setting) {
        this.sublime = sublime;
        this.vscode = vscode || { name: MappedSetting.NO_MATCH, value: MappedSetting.NO_MATCH };
    }

    setVscode(setting: Setting) {
        this.vscode = setting;
    }

    public static hasNoMatch(setting: MappedSetting) {
        if (setting && setting.vscode) {
            return setting.vscode.name === MappedSetting.NO_MATCH;
        }
        return true;
    }
}

export class Importer {
    private settingsMap: { [key: string]: string } = {};
    constructor() {
        this.readSettingsMap().then(settings => {
            this.settingsMap = settings;
        });
    }

    private mapAllSettings(sourceSettings): MappedSetting[] {
        var mappedSettings: MappedSetting[] = []
        for (var key in sourceSettings) {
            var setting = sourceSettings[key]
            let ms: MappedSetting = new MappedSetting(new Setting(key, setting));

            var mapped = this.mapSetting(key, setting)
            if (mapped) {
                ms.setVscode(mapped);
            }
            mappedSettings.push(ms);
        }
        return mappedSettings
    }

    private mapSetting(key: string, value: string): Setting {
        var mappedSetting: string | object = this.settingsMap[key]
        if (mappedSetting) {
            if (typeof mappedSetting === 'string') {
                return new Setting(mappedSetting, value)
            } else if (typeof mappedSetting === 'object') {
                const obj = mappedSetting[value];
                let newKey = Object.keys(obj)[0]
                let newValue = obj[newKey];
                return new Setting(newKey, newValue)
            }
        }

        return null
    }

    async updateSettingsAsync(settings: Setting[]) {
        for (const setting of settings) {
            const namespace = setting.name.split('.')[0];
            const settingName = setting.name.split('.')[1];
            var config = vscode.workspace.getConfiguration(namespace);
            if (config && settingName) {
                try {
                await config.update(settingName, setting.value, vscode.ConfigurationTarget.Global);
                } catch(e) {
                    console.log(e);
                }
                const exists = config.has(settingName);
                // const gitConfig = workspace.getConfiguration('git');
                // gitConfig.update('autofetch', true, ConfigurationTarget.Global);
                if (!exists) {
                    console.log(setting.name + ' failed to add to config!');
                }
                
            }
        };
    }

    private readSettingsMap(): Promise<{ [key: string]: string }> {
        var mapPath = path.resolve(__dirname, '..', 'map.json')

        return promisifier(fs.readFile, mapPath, 'UTF-8').then(data => {
            return rjson.parse(data.toString());
        });
    }

    getMatchingGlobalSettings() {
        return this.folderPicker().then(sublimePath => {
            if (!sublimePath) {
                return undefined;
            }

            return this.mapGlobalSettings(sublimePath);
        });

    }

    private mapGlobalSettings(settingsPath: string): Thenable<MappedSetting[] | undefined> {
        return promisifier(fs.readFile, settingsPath)
            .then(data => {
                const globalSettings = rjson.parse(data.toString())
                const mappedGlobalSettings = this.mapAllSettings(globalSettings)
                return mappedGlobalSettings;
            });
    }

    // TODO: handle case when user selects wrong folder
    private async folderPicker(): Promise<string | undefined> {
        const defaultPaths = await sublimeFolderFinder.findSettingsPathAsync();
        const browseOption = 'Browse...';
        const pick = await vscode.window.showQuickPick([...defaultPaths.map(p => p.fsPath), browseOption],
            { 'placeHolder': `Select your Sublime-Text folder from the list or click on ${browseOption}` });
        if (!pick) {
            return undefined;
        } else if (pick === browseOption) {
            return this.browseForSublimeFolder();
        } else {
            return pick;
        }
    }

    private browseForSublimeFolder() {
        return vscode.window.showOpenDialog({ canSelectFolders: true })
            .then(async ([folderPath] = []) => {
                if (!folderPath) {
                    return undefined;
                }
                const paths = await sublimeFolderFinder.filterForExistingDirsAsync([folderPath.fsPath]);
                if (!paths.length) {
                    return undefined;
                }
                return paths[0].fsPath;
            });
    }
}
