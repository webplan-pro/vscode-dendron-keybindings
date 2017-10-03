const vscode = require('vscode')
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer')

class Extension {

    constructor() {
        this.importer = new Importer()
        this.messages = {
            yes: 'Yes',
            no: 'No',
            finished: 'Import finished!',
            failed: 'Import failed :( '
        }
    }

    start() {
        this.importer.analyze().then(analysis => {
            var text = ['We found']

            if (analysis.globalCount) {
                text.push(`${analysis.globalCount} Global settings,`)
            }

            if (analysis.projectCount) {
                text.push(`${analysis.globalCount} Project settings,`)
            }

            if (analysis.snippetsCount) {
                text.push(`${analysis.snippetsCount} snippets`)
            }

            text.push('. Want to continue?')

            showInformationMessage(text.join(' '), this.messages.yes, this.messages.no).then(result => {
                this.importer
                    .importEverything()
                    .then(results => {
                        showInformationMessage(this.messages.finished)
                    })
                    .catch(err => {
                        showInformationMessage(this.messages.failed + '(' + err + ')')
                    })
            })
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