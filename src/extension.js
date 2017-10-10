const vscode = require('vscode')
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer')
const sublime = require('./sublime')
const listify = require('listify')

class Extension {

    constructor() {
        this.importer = new Importer()
        this.messages = {
            yes: 'Yes',
            no: 'No',
            finished: 'Import from Sublime Text finished!',
            failed: 'Import failed :( '
        }
        this.extensionConfig = vscode.workspace.getConfiguration('sublimeImporter')
        this.hasPromptedOnStartup = this.extensionConfig.get('hasPromptedOnStartup') || false
    }

    start() {
        this.importer.analyze().then(analysis => {
            var analysisTextParts = []

            if (analysis.globalCount) {
                analysisTextParts.push(`${analysis.globalCount} global settings`)
            }

            if (analysis.projectCount) {
                analysisTextParts.push(`${analysis.globalCount} project settings`)
            }

            if (analysis.snippetsCount) {
                analysisTextParts.push(`${analysis.snippetsCount} snippets`)
            }

            if (!analysis.globalCount && 
                !analysis.projectCount && 
                !analysis.snippetsCount) {
                return
            }

            var analysisText = listify(analysisTextParts)

            var text = `We found ${analysisText} from Sublime Text. Want to import them?`

            showInformationMessage(text, this.messages.yes, this.messages.no).then(result => {
                if (result == this.messages.no) {
                    return
                }

                this.importer
                    .importEverything()
                    .then(results => {
                        showInformationMessage(this.messages.finished)
                        // TODO: Store setting so we don't prompt again
                    })
                    .catch(err => {
                        showInformationMessage(`${this.messages.failed} (${err})`)
                    })
            })
        })
    }

    disablePrompt() {
        this.extensionConfig.update('hasPromptedOnStartup', true, true)
        this.hasPromptedOnStartup = true
    }
}

const activate = (context) => {

    this.extension = new Extension();

    if(!this.extension.hasPromptedOnStartup) {
        sublime.isInstalled().then(() => {
            this.extension.start();
            this.extension.disablePrompt()
        })
    }

    var cmd = vscode.commands.registerCommand('extension.importFromSublime', function (e) {
        this.extension.start();
    })

    context.subscriptions.push(cmd)
}

module.exports = {
    activate
};