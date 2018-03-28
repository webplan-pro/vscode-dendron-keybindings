import * as vscode from 'vscode';
let start = new Date().getTime();
import { HTMLCreator } from "./htmlCreation/htmlCreator";
console.log(new Date().getTime() - start);
import { Importer } from "./importer";
import * as sublimeFolderFinder from './sublimeFolderFinder';
import { JSDOM } from 'jsdom';
import { MappedSetting, Setting } from './settings';

export const scheme = 'vs-code-html-preview';
const previewUri = vscode.Uri.parse(`${scheme}://authority/vs-code-html-preview`);

interface ISettingsPacket {
    data: [{ name: string, value: string }];
}

export class HTMLPreviewEditor {

    private _onDidChange: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;
    private userSelectedPath: vscode.Uri;
    private isValid: boolean = true;

    private _htmlCreator: HTMLCreator;
    private _importer: Importer;

    constructor(private context: vscode.ExtensionContext) {
        context.subscriptions.push(this._onDidChange);
        context.subscriptions.push(vscode.commands.registerCommand('extension.importFromSublime', () => this.open()));
        context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, this));
        context.subscriptions.push(vscode.commands.registerCommand('extension.userClickedOnBrowseButtonFromGUI', () => this.pickFolder()));
        context.subscriptions.push(vscode.commands.registerCommand('extension.selectedSettingsFromGUI', (packet: ISettingsPacket) => this.onDidSettingSelected(packet)));
        context.subscriptions.push(vscode.commands.registerCommand('extension.reload', () => this._onDidChange.fire(previewUri)));
    }

    async provideTextDocumentContent(): Promise<string> {
        const htmlCreator = await this.getHTMLCreator();
        const path = await this.getSettingsPath();
        const settings: MappedSetting[] | undefined = this.isValid && path ? await this.getSettings(path.fsPath) : [];

        await htmlCreator.resetHTMLAsync();

        // create & display HTML Table
        await htmlCreator.onNewSettingsAsync(settings, path, this.isValid);

        const htmlDoc: JSDOM = await htmlCreator.getHtmlAsync();
        return htmlDoc.serialize();
    }

    private open() {
        vscode.commands.executeCommand<any>('vscode.previewHtml', previewUri, vscode.ViewColumn.Active, 'Sublime Settings Importer');
    }

    private async pickFolder() {
        const folderPickerResult: sublimeFolderFinder.ISublimeSettingsPickerResult = await sublimeFolderFinder.pickSublimeSettings();
        if (folderPickerResult) {
            if (!folderPickerResult.sublimeSettingsPath) {
                vscode.window.showWarningMessage('No settings folder found');
            }
            this.userSelectedPath = folderPickerResult.path;
            this.isValid = !!folderPickerResult.sublimeSettingsPath;
            this._onDidChange.fire(previewUri);
        }
    }

    private async onDidSettingSelected(packet: ISettingsPacket) {
        if (packet.data) {
            const settings: Setting[] = packet.data.map(setting => new Setting(setting.name, JSON.parse(setting.value)));
            const importer = await this.getImporter();
            importer.updateSettingsAsync(settings);
        }
        else {
            console.error(`Unhandled message: ${JSON.stringify(packet.data)}`);
        }
    }

    private async getSettings(path: string): Promise<MappedSetting[]> {
        const importer = await this.getImporter();
        let settings: MappedSetting[] | undefined = await importer.getMappedSettingsAsync(path);
        settings = settings.filter(s => !MappedSetting.hasNoMatch(s));
        settings.sort((a, b) => {
            if (a.isDuplicate && b.isDuplicate) {
                return a.sublime.name.localeCompare(b.sublime.name);
            } else if (a.isDuplicate) {
                return -1;
            } else if (b.isDuplicate) {
                return 1;
            }
            return a.sublime.name.localeCompare(b.sublime.name)
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

    private async getHTMLCreator(): Promise<HTMLCreator> {
        if (!this._htmlCreator) {
            this._htmlCreator = await HTMLCreator.initializeAsync(vscode.Uri.file(this.context.asAbsolutePath('')));
        }
        return this._htmlCreator;
    }

    private async getImporter(): Promise<Importer> {
        if (!this._importer) {
            this._importer = await Importer.initAsync();
        }
        return this._importer;
    }
}

