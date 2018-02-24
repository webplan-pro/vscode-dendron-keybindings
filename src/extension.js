const vscode = require('vscode');
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer');
const listify = require('listify');
const fs = require('fs');
const promisifier = require('./FileSystem');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');
// // TODO: hardcoded
const tableTag = `<table id='dynamic-table--sublime-settings' class='greyGridTable'></table>`;
    
function getMediaPath(context, mediaFile) {
    return vscode.Uri.file(context.asAbsolutePath(mediaFile))
        .with({ scheme: 'vscode-extension-resource' })
        .toString();
}

class Extension {

    constructor(importer, textProvider) {
        this.importer = importer;
        this.textProvider = textProvider;
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
        const that = this;
        return this.importer.analyze().then(analysis => {
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
                    .showGlobalSettings()
                    .then(results => {
                        for (const result of results) {
                            that.textProvider.update(result);
                        }
                    })
                    // .importEverything()
                    // .then(results => {
                    //     showInformationMessage(this.messages.finished)
                    //     // TODO: Store setting so we don't prompt again
                    // })
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
    const importer = new Importer();
    const provider = registerTxtDocumentProvider(context);
    const extension = new Extension(importer, provider);

    // const promise = wsServer.setupWebsocketConnection(context);
    context.subscriptions.push([
        vscode.commands.registerCommand('extension.importFromSublime', () => {
            extension.start().then(() => {
                vscode.commands.executeCommand(
                    'vscode.previewHtml',
                    previewUri,
                    vscode.ViewColumn.Two,
                    'Sublime Settings Importer'
                ).then(null, error => console.error(error));
            });
        }),
        vscode.commands.registerCommand('extension.getResponseFromGUI', (msg) => {
            console.log('Received:', msg);
            if (typeof msg === 'string') {
                console.log(`Message received in Extension Host: ${msg}`);
            }
            else if (msg.name && msg.value) {
                importer._updateSettings('global', [{ name: msg.name, value: msg.value }]);
                provider.update(msg);
            }
            else {
                console.error(`Unhandled message type: ${typeof msg}`);
            }
        })
    ]);
}

function registerTxtDocumentProvider(context) {
    const provider = new TextDocumentContentProvider(context);
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(
            previewUri.scheme,
            provider)
    );
    return provider;
}

class TextDocumentContentProvider {

    constructor(context) {
        this.context = context;
        this.html = null;
        this.callUpdate = null;
        this._onDidChange = new vscode.EventEmitter();
    }

    provideTextDocumentContent() {
        return new Promise((resolve, reject) => {
            if (this.html) {
                resolve(this.html);
                return;
            } else {
                let htmlPath = vscode.Uri.file(`${this.context.asAbsolutePath('src/content.html')}`);
                return promisifier.nfcall(fs.readFile, htmlPath.fsPath, 'utf8').then((html) => {
                    
                    this.html = html.replace('$$IMPORT_CSS_SCRIPTS$$', `<link rel="stylesheet" type="text/css" href="file://${this.context.asAbsolutePath('src/style.css')}">`)
                        .replace('$$IMPORT_JS_SCRIPTS$$', `<script src="file://${this.context.asAbsolutePath('src/gui.js')}"></script>`);
                    resolve(this.html);
                })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    });
            }
        })
    }

    get onDidChange() {
        return this._onDidChange.event;
    }

    update(newData) {
        this.html = this.html.replace(tableTag, createTable(newData));
        this._onDidChange.fire(previewUri);
    }
}

function createTable(...newData) {
    // TODO: hardcoded
    var tableString = tableTag.replace('</table>', '');

    for (let row of newData) {

        tableString += "<tr>";

        tableString += "<td class='wanted'>" + row.name + "</td>";
        tableString += "<td class='wanted'>" + row.value + "</td>";

        tableString += "</tr>";
    }

    tableString += "</table>";
    return tableString;
}

module.exports = {
    activate
};