const vscode = require('vscode');
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer');
const listify = require('listify');
const fs = require('fs');
const promisifier = require('./FileSystem');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');

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
            extension.start();
            vscode.commands.executeCommand(
                'vscode.previewHtml',
                previewUri,
                vscode.ViewColumn.Two,
                'Sublime Settings Importer'
            ).then(null, error => console.error(error));
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
        // this._onDidChange = new vscode.EventEmitter();
        this.htmlCache = null;
        this.callUpdate = null;
    }

    provideTextDocumentContent() {
        return new Promise((resolve, reject) => {
            if (this.htmlCache) {
                resolve(this.htmlCache);
                return;
            } else {
                let htmlPath = vscode.Uri.file(`${this.context.asAbsolutePath('src/content.html')}`);
                return promisifier.nfcall(fs.readFile, htmlPath.fsPath, 'utf8').then((html) => {
                    const htmlWithDeps = html.replace('$$GUI_JS_PATH$$', `<script src="file://${this.context.asAbsolutePath('src/gui.js')}"></script>`);
                    this.htmlCache = htmlWithDeps;
                    resolve(htmlWithDeps);
                })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    });
            }
        });
    };

    onDidChange(fn) {
        this.callUpdate = fn;
        // return this._onDidChange.event;
    }

    update(newData) {
        if (this.htmlCache) {
            this.htmlCache = this.htmlCache.replace('</ul>', `<li>${newData.name}: ${newData.value}</li></ul>`)
            // this._onDidChange.fire(previewUri);
            this.callUpdate(previewUri);
            // vscode.workspace.provideTextDocumentContent(previewUri.scheme);
        }
    }
}

module.exports = {
    activate
};