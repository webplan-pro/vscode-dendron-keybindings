const vscode = require('vscode')
const showInformationMessage = vscode.window.showInformationMessage
const Importer = require('./importer')
const sublime = require('./sublime')
const listify = require('listify')
const { Server: WebSocketServer } = require('ws');
const fs = require('fs');

const previewUri = vscode.Uri.parse('vs-code-html-preview://authority/vs-code-html-preview');

class MyWebSocketsServer {

    constructor(importer) {
        this.__importer = importer;
        this.__ws = null;
    }

    setupWebsocketConnection(context) {
        return new Promise((resolve, reject) => {
            // Note that one drawback to the current implementation is that no
            // authentication is done on the WebSocket, so any user on the local host
            // can connect to it.
            var server = new WebSocketServer({ port: 0 });
            server.on('listening', () => {
                let port = this.onDidWebSocketServerStartListening(server, context);
                registerTxtDocumentProvider(context, port);
                resolve();
            });

            server.on('error', (e) => {
                reject(e);
            });

            context.subscriptions.push(
                new vscode.Disposable(() => {
                    server.close();
                })
            );
        });
    }

    onDidWebSocketServerStartListening(server, context) {
        // It would be better to find a sanctioned way to get the port.
        var { port } = server._server.address();

        const that = this;
        server.on('connection', ws => {
            this.__ws = ws;
            // Note that message is always a string, never a Buffer.
            this.__ws.on('message', message => {
                const msgObj = JSON.parse(message);
                if (typeof msgObj === 'string') {
                    console.log(`Message received in Extension Host: ${msgObj}`);
                } 
                else if (msgObj.name && msgObj.value){
                    that.__importer._updateSettings('global', [{name: msgObj.name, value: msgObj.value}]);
                } 
                else {
                    console.error(`Unhandled message type: ${typeof msgObj}`);
                }
            });
        });

        return port;
    }

    send(arg) {
        this.__ws.send(JSON.stringify(arg));
    }
}

class Extension {

    constructor(importer, ws) {
        this.importer = importer;
        this.__ws = ws;
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
                    .showGlobalSettings()
                    .then(results => {
                        for (const result of results) {
                            this.__ws.send(result);
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
    let importer = new Importer();
    let wsServer = new MyWebSocketsServer(importer);
    this.extension = new Extension(importer, wsServer);   // FIXME: global var

    if (!this.extension.hasPromptedOnStartup) {
        sublime.isInstalled().then(() => {
            this.extension.start();
            this.extension.disablePrompt()
        })
            .catch(e => console.error(e));
    }

    const promise = wsServer.setupWebsocketConnection(context);
    var cmd = vscode.commands.registerCommand('extension.importFromSublime', (e) => {
        this.extension.start();
        promise.then(() => {
            vscode.commands.executeCommand(
                'vscode.previewHtml',
                previewUri,
                vscode.ViewColumn.Two,
                'Sublime Settings Importer'
            ).then(null, error => console.error(error));
        });
    });

    context.subscriptions.push(cmd)
}

function registerTxtDocumentProvider(context, port) {
    var textDocumentContentProvider = {
        provideTextDocumentContent(uri/*: vscode.Uri*/)/*: string*/ {
            let htmlPath = vscode.Uri.file(`${context.asAbsolutePath('src/content.html')}`);
            try {
                let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
                html = html
                    .replace('$$WS_PORT$$', `<script>var WS_PORT = ${port};</script>`)
                    .replace('$$GUI_JS_PATH$$', `<script src="file://${context.asAbsolutePath('src/gui.js')}"></script>`);
                return html;
            } catch (err) {
                console.error(err);
                return;
            }
        },
    };
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(
            previewUri.scheme,
            textDocumentContentProvider)
    );
}

module.exports = {
    activate
};