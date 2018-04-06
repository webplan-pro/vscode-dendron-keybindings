import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { Importer } from './importer';
import { MappedSetting, Setting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';
export const scheme = 'vs-code-html-preview';
const previewUri = vscode.Uri.parse(`${scheme}://authority/vs-code-html-preview`);

interface ISettingsPacket {
    data: [{ name: string, value: string }];
}

interface IFrontendData {
    mappedSettings: MappedSetting[];
    sublimeSettingsPath: string;
    isValid: boolean;
}

export class HTMLPreviewEditor {

    private _onDidChange: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    public readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;
    private userSelectedPath: string = '';
    private isValid: boolean = true;

    constructor(private context: vscode.ExtensionContext, private importer: Importer) {
        context.subscriptions.push(this._onDidChange);
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublimeHTML', () => this.open()));
        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, this));
        context.subscriptions.push(vscode.commands.registerCommand('extension.onBrowseButtonClicked', () => this.pickFolder()));
        context.subscriptions.push(vscode.commands.registerCommand('extension.onImportSelectedSettings',
            (packet: ISettingsPacket) => this.onImportSelectedSettings(packet)));
        context.subscriptions.push(vscode.commands.registerCommand('extension.reload', () => this._onDidChange.fire(previewUri)));
    }

    public async provideTextDocumentContent(): Promise<string> {
        const settingsPath = await this.getSettingsPath();
        const settings: MappedSetting[] | undefined = this.isValid && settingsPath ? await this.getSettings(settingsPath) : [];
        return this.getHTML({
            mappedSettings: settings,
            sublimeSettingsPath: settingsPath || '',
            isValid: this.isValid,
        });
    }

    private open(): void {
        vscode.commands.executeCommand<any>('vscode.previewHtml', previewUri, vscode.ViewColumn.Active, 'Sublime Settings Importer');
    }

    private async pickFolder(): Promise<void> {
        const sublimeSettingsPath: vscode.Uri | undefined = await sublimeFolderFinder.pickSublimeSettings();
        if (sublimeSettingsPath) {
            if (sublimeSettingsPath) {
                this.userSelectedPath = sublimeSettingsPath.fsPath;
            } else {
                vscode.window.showWarningMessage('No settings folder found');
            }
            this.isValid = !!sublimeSettingsPath;
            this._onDidChange.fire(previewUri);
        }
    }

    private async onImportSelectedSettings(packet: ISettingsPacket): Promise<void> {
        if (packet.data) {
            const settings: Setting[] = packet.data.map((setting) =>
                new Setting(decodeURIComponent(setting.name), JSON.parse(decodeURIComponent(setting.value))));
            await this.importer.updateSettingsAsync(settings);
            await vscode.commands.executeCommand('workbench.action.openGlobalSettings');
        } else {
            console.error(`Unhandled message: ${JSON.stringify(packet.data)}`);
        }
    }

    private async getSettings(sublimeSettingsPath: string): Promise<MappedSetting[]> {
        const importer = await this.importer;
        let settings: MappedSetting[] | undefined = await importer.getMappedSettingsAsync(await readFileAsync(sublimeSettingsPath, 'utf-8'));
        settings = settings.filter((s) => !MappedSetting.hasNoMatch(s));
        settings.sort((a, b) => {
            if (a.isDuplicate && b.isDuplicate) {
                return a.sublime.name.localeCompare(b.sublime.name);
            } else if (a.isDuplicate) {
                return -1;
            } else if (b.isDuplicate) {
                return 1;
            }
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        return settings;
    }

    private async getSettingsPath(): Promise<string | undefined> {
        if (this.userSelectedPath) {
            return this.userSelectedPath;
        }
        const defaultSublimePath: vscode.Uri | undefined = await sublimeFolderFinder.getExistingDefaultPaths();
        return defaultSublimePath ? defaultSublimePath.fsPath : undefined;
    }

    private getHTML(frontendData: IFrontendData): string {
        const projectRoot: string = vscode.Uri.file(this.context.asAbsolutePath('')).fsPath;

        return `
            <html>

            <head>
                <link rel="stylesheet" type="text/css" href="file://${projectRoot}/resources/style.css">
            </head>

            <body>
                <div id="frontendData" data-frontend=${encodeURI(JSON.stringify(frontendData))}></div>
                <div id="sublimeSettingsImporter">

                    <h3>Import Settings from Sublime Text</h3>
                    <div class="selectFolder">
                        <div class="reloadIcon"></div>
                        <input id="settingsPathContainer" name="settingsPathContainer" placeholder="Sublime Settings Folder required." readonly>
                        <button class="browseButton">Browse...</button>
                    </div>

                    <!-- Import Settings Tab Start -->
                    <div id='settingsTableMapper'>
                        <div class="settingsTable">
                            <div class="headerRow">
                                <div id='selectAllCheckbox' class="checkbox">
                                    <input class="select_all_checkbox ui checkbox" type="checkbox">
                                </div>
                                <div class="title">Sublime</div>
                                <div>
                                    <i class="mapping-arrow long arrow alternate right icon"></i>
                                </div>
                                <div class="title">VS Code</div>
                            </div>
                            <div id="mappedSettings" class="mappedSettings">
                            </div>
                        </div>
                        <button id='add-settings-button' class="import-button">Import</button>
                    </div>
                </div>
            </body>
            <script src="file://${projectRoot}/out/browser/settingsPageFrontend.js"></script>

            </html>
        `;
    }
}
