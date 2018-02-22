const fs = require('fs')
const path = require('path')
const vscode = require('vscode')
const rjson = require('relaxed-json')
const AppDirectory = require('appdirectory')

const Setting = require('./setting')

class Importer {
    constructor() {
        this._readSettingsMap()
    }

    _mapAllSettings(sourceSettings) {
        var mappedSettings = []
        for (var key in sourceSettings) {
            var setting = sourceSettings[key]
            var mapped = this._mapSetting(key, setting)
            if (mapped) {
                mappedSettings.push(mapped)
            }
        }
        return mappedSettings
    }

    _mapSetting(key, value) {
        var mappedSetting = this.settingsMap[key]
        if (mappedSetting) {
            if (typeof mappedSetting === 'string') {
                return new Setting(mappedSetting, value)
            } else if (typeof mappedSetting === 'object') {
                let newKey = Object.keys(mappedSetting[value])[0]
                let newValue = Object.values(mappedSetting[value])[0]
                return new Setting(newKey, newValue)
            }
        }

        return null
    }

    _updateSettings(type, settings) {
        settings.forEach(setting => {
            var namespace = setting.name.split('.')[0]
            var settingName = setting.name.split('.')[1]

            var config = vscode.workspace.getConfiguration(namespace)
            var isGlobalSetting = type == 'global'
            if (config && settingName) {
                config.update(settingName, setting.value, isGlobalSetting)
            }
        })
    }

    _readSettingsMap() {
        var mapPath = path.resolve(__dirname, '..', 'map.json')

        fs.readFile(mapPath, 'UTF-8', (err, data) => {
            if (err) {
                return err
            }
            this.settingsMap = rjson.parse(data.toString())
        })
    }

    importEverything() {
        return Promise.all([
            this.importGlobalSettings(), 
            this.importProjectSettings(), 
            this.importSnippets()
        ])
    }    

    importSnippets() {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    // TODO: temp, remove
    showGlobalSettings() {
        return new Promise((resolve, reject) => {
            this.analyzeGlobalSettings()
                .then(mappedSettings => {
                    resolve(mappedSettings);
                })
                .catch(reject)
        });
    }

    importGlobalSettings() {
        return new Promise((resolve, reject) => {
            this.analyzeGlobalSettings()
                .then(mappedSettings => {
                    if (mappedSettings.length) {
                        this._updateSettings('global', mappedSettings)
                    }
                    resolve()
                })
                .catch(reject)
        })
    }

    importProjectSettings() {
        return new Promise((resolve, reject) => {
            this.analyzeProjectSettings()
                .then(mappedSettings => {
                    if (mappedSettings.length) {
                        this._updateSettings('workspace', mappedSettings)
                    }
                    resolve()
                })
                .catch(reject)
        })
    }

    analyze() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.analyzeProjectSettings(),
                this.analyzeGlobalSettings(),
                this.analyzeSnippets()
            ]).then(data => {
                resolve({
                    projectCount: data[0].length,
                    globalCount: data[1].length,
                    snippetsCount: data[2].length
                })
            })
        })
    }

    analyzeGlobalSettings() {
        var dirs = 'C:/Users/t-tisali/AppData/Roaming/Sublime Text 3' // new AppDirectory('Sublime Text 3');
        var settingsPath = path.resolve(dirs, 'Packages', 'User', 'Preferences.sublime-settings')

        // TODO: Check if files exists first

        return new Promise((resolve, reject) => {
            fs.readFile(settingsPath, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    var globalSettings = rjson.parse(data.toString())
                    var mappedGlobalSettings = this._mapAllSettings(globalSettings)
                    resolve(mappedGlobalSettings)
                }
            })
        })
    }

    analyzeProjectSettings() {
        return new Promise((resolve, reject) => {
            // TODO: Handle multi workspaces?
            vscode.workspace.findFiles('*.sublime-project', 2).then(files => {
                if (!files.length) {
                    resolve([]) // No files to map
                    return
                }

                // Take first file
                var projectFilePath = files[0].fsPath

                fs.readFile(projectFilePath, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        var projectFile = rjson.parse(data.toString())
                        var projectSettings = projectFile.settings

                        // Map project settings
                        var mappedProjectSettings = this._mapAllSettings(projectSettings)

                        resolve(mappedProjectSettings)
                    }
                })
            })
        })
    }

    analyzeSnippets() {
        console.log('importSnippets')

        return new Promise((resolve, reject) => {
            resolve([])
        })
    }
}

module.exports = Importer
