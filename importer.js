const fs = require('fs')
const vscode = require('vscode')
var rjson = require('relaxed-json');

function updateSettings(editorConfig, settings) {
    settings.forEach((setting) => {
        editorConfig.update(setting.name, setting.value, isGlobalConfigValue)
    });
}

class Setting {
    constructor(name, value) {
        this.name = name
        this.value = value
    }
}

const versionThreeSettings = [
    new Setting('multiCursorModifier', 'ctrlCmd'),
    new Setting('snippetSuggestions', 'top'),
    new Setting('formatOnPaste', true)
];

class Importer {

    constructor() {
        
    }

    importSnippets() {
        console.log('importSnippets')

        return Promise.resolve({
            type: 'snippets',
            count: 1
        })
    }

    importGlobalsettings() {
        console.log('importGlobalsettings')
        var path = '/Users/auchenberg/Library/Application Support/Sublime Text 3/Packages/User/Preferences.sublime-settings'

        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    var json = rjson.parse(data.toString())
                    console.log(json)

                    resolve({
                        type: 'global',
                        count: 33
                    })                    
                }
            })    
        })
    }

    importProjectsettings() {
        console.log('importProjectsettings')

        return Promise.resolve({
            type: 'project',
            count: 3
        })
    }

}

module.exports = Importer;
