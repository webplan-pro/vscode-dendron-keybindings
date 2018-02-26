import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import * as rjson from 'relaxed-json';
import { nfcall as promisifier } from './Filesystem';

import { Setting } from './setting';
import * as sublimeFolderFinder from './sublimeFolderFinder';

export class Importer {
    private settingsMap: { [key: string]: string } = {};
    constructor() {
        this._readSettingsMap().then(settings => {
            this.settingsMap = settings;
        });
    }

    _mapAllSettings(sourceSettings): Array<Setting> {
        var mappedSettings = []
        for (var key in sourceSettings) {
            var setting = sourceSettings[key]
            var mapped = this._mapSetting(key, setting)
            if (mapped) {
                mappedSettings.push(mapped);
            }
        }
        return mappedSettings
    }

    _mapSetting(key: string, value: string): Setting {
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

    updateSettings(settings: Setting[]) {
        settings.forEach(setting => {
            var namespace = setting.name.split('.')[0]
            var settingName = setting.name.split('.')[1]

            var config = vscode.workspace.getConfiguration(namespace)
            if (config && settingName) {
                config.update(settingName, setting.value, true)
            }
        });
    }

    _readSettingsMap(): Promise<{ [key: string]: string }> {
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

    mapGlobalSettings(settingsPath: string): Thenable<Setting[] | undefined> {
        // TODO: Check if files exists first
        return promisifier(fs.readFile, settingsPath)
            .then(data => {
                var globalSettings = rjson.parse(data.toString())
                var mappedGlobalSettings = this._mapAllSettings(globalSettings)
                return mappedGlobalSettings;
            });
    }


    // TODO: handle case when user selects wrong folder
    async folderPicker(): Promise<string | undefined> {
        const defaultPaths = await sublimeFolderFinder.findSettingsPathAsync();
        const browseOption = 'Browse...';
        const pick = await vscode.window.showQuickPick([...defaultPaths.map(p => p.fsPath), browseOption], { 'placeHolder': `Select your settings folder from the list or click on ${browseOption}` });
        if (!pick) {
            return undefined;
        } else if (pick === browseOption) {
            return vscode.window.showOpenDialog({ canSelectFolders: true })
                .then(([folderPath] = []) => {
                    return path.join(folderPath.fsPath, sublimeFolderFinder.sublimeSettingsPath) || undefined;
                });
        } else {
            return pick;
        }
    }
}
