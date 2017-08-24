const vscode = require('vscode')
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer')

class Extension {

    constructor() {
        this.importer = new Importer()
        this.messages = {
            yes: 'Yes',
            no: 'No',
            userSettings: 'Do you want to import your User Settings from Sublime Text?',
            projectSettings: 'Do you want to import your Project Settings from Sublime Text?',
            snippets: 'Do you want to import your Snippets from Sublime?',
            finished: 'Import finished. We found',
            skipped: 'Import skipped.'
        }
    }

    start() {
        var jobs = []

        Promise.all([
            showInformationMessage(this.messages.userSettings, this.messages.yes, this.messages.no),
            showInformationMessage(this.messages.projectSettings, this.messages.yes, this.messages.no),
            showInformationMessage(this.messages.snippets, this.messages.yes, this.messages.no)
        ]).then((data) => {

            let user = data[0]
            let project = data[1]
            let snippets = data[2]

            if (user === this.messages.yes) {
                jobs.push(this.importer.importGlobalsettings())
            }

            if (project === this.messages.yes) {
                jobs.push(this.importer.importProjectsettings())
            }

            if (snippets === this.messages.yes) {
                jobs.push(this.importer.importSnippets())
            }

            if(jobs.length) {
                Promise.all(jobs).then((stats) => {

                    let snippestStats = stats.find((s) => s.type == 'snippets')
                    let globalStats = stats.find((s) => s.type == 'global')
                    let projectStats = stats.find((s) => s.type == 'project')

                    var text = [this.messages.finished]
                    
                    if(snippestStats) {
                        text.push(`${snippestStats.count} snippets,`)
                    }
                    
                    if(globalStats) {
                        text.push(`${globalStats.count} Global settings,`)
                    }

                    if(projectStats) {
                        text.push(`${projectStats.count} Project settings`)
                    }

                    showInformationMessage(text.join(' '))
                })
            } else {
                showInformationMessage(this.messages.skipped)
            }
        })
    }
}

const activate = (context) => {

    var cmd = vscode.commands.registerCommand('extension.importFromSublime', function (e) {
        new Extension().start()
    })

    context.subscriptions.push(cmd)
}

module.exports = {
    activate
};