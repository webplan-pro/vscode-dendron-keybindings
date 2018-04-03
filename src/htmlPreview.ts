import * as vscode from 'vscode';
import { Importer } from './importer';
import { MappedSetting, Setting } from './settings';
import * as sublimeFolderFinder from './sublimeFolderFinder';
import { ISublimeSettingsPickerResult } from './sublimeFolderFinder';

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
    readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;
    private userSelectedPath: vscode.Uri;
    private isValid: boolean = true;

    private _importer: Importer;

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(this._onDidChange);
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => this.open()));
        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, this));
        context.subscriptions.push(vscode.commands.registerCommand('extension.onBrowseButtonClicked', () => this.pickFolder()));
        context.subscriptions.push(vscode.commands.registerCommand('extension.onImportSelectedSettings', (packet: ISettingsPacket) => this.onImportSelectedSettings(packet)));
        context.subscriptions.push(vscode.commands.registerCommand('extension.reload', () => this._onDidChange.fire(previewUri)));
    }

    public async provideTextDocumentContent(): Promise<string> {
        const path = await this.getSettingsPath();
        const settings: MappedSetting[] | undefined = this.isValid && path ? await this.getSettings(path.fsPath) : [];
        return this.getHTML({
            mappedSettings: settings,
            sublimeSettingsPath: path.fsPath,
            isValid: this.isValid,
        });
    }

    private open() {
        vscode.commands.executeCommand<any>('vscode.previewHtml', previewUri, vscode.ViewColumn.Active, 'Sublime Settings Importer');
    }

    private async pickFolder() {
        const folderPickerResult: ISublimeSettingsPickerResult = await sublimeFolderFinder.pickSublimeSettings();
        if (folderPickerResult) {
            if (folderPickerResult.sublimeSettingsPath) {
                this.userSelectedPath = folderPickerResult.sublimeSettingsPath;
            } else {
                vscode.window.showWarningMessage('No settings folder found');
            }
            this.isValid = !!folderPickerResult.sublimeSettingsPath;
            this._onDidChange.fire(previewUri);
        }
    }

    private async onImportSelectedSettings(packet: ISettingsPacket) {
        if (packet.data) {
            const settings: Setting[] = packet.data.map((setting) => new Setting(setting.name, JSON.parse(setting.value)));
            const importer = await this.getImporter();
            importer.updateSettingsAsync(settings);
        } else {
            console.error(`Unhandled message: ${JSON.stringify(packet.data)}`);
        }
    }

    private async getSettings(path: string): Promise<MappedSetting[]> {
        const importer = await this.getImporter();
        let settings: MappedSetting[] | undefined = await importer.getMappedSettingsAsync(path);
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

    private async getSettingsPath(): Promise<vscode.Uri> {
        if (this.userSelectedPath) {
            return this.userSelectedPath;
        }
        const defaultSublimePaths = await sublimeFolderFinder.getExistingDefaultPaths();
        return defaultSublimePaths && defaultSublimePaths.length ? defaultSublimePaths[0].settings : null;
    }

    private async getImporter(): Promise<Importer> {
        if (!this._importer) {
            this._importer = await Importer.initAsync();
        }
        return this._importer;
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
