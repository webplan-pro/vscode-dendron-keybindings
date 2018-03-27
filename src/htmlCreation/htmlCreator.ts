import { JSDOM } from 'jsdom';
import * as vscode from 'vscode';
import { SettingsTable } from './settingsTable';
import { Dom } from './dom';
import { CategorizedSettings } from '../extension';

export class HTMLCreator {
    private settingsPage: SettingsTable;
    private dom: Dom;

    private constructor() { }

    public static async initializeAsync(projectRoot: vscode.Uri): Promise<HTMLCreator> {
        return new HTMLCreator().initAsync(projectRoot);
    }

    private async initAsync(projectRoot: vscode.Uri): Promise<HTMLCreator> {
        this.dom = await Dom.initAsync(projectRoot);
        this.settingsPage = new SettingsTable(this.dom);
        return this;
    }

    public async resetHTMLAsync() {
        return this.dom.getHtmlAsync(true);
    }

    public async getHtmlAsync(): Promise<JSDOM> {
        return this.dom.getHtmlAsync();
    }

    public async onNewSettingsAsync(newData: CategorizedSettings, sublimeSettingsPath: vscode.Uri, isValid: boolean): Promise<void> {
        if (sublimeSettingsPath) {
            const sublimeSettingsPathContainer = this.dom.getElementByIDThrows('settingsPathContainer');
            sublimeSettingsPathContainer.textContent = sublimeSettingsPath.fsPath;
            sublimeSettingsPathContainer.title = sublimeSettingsPath.fsPath;
            const reloadIcon = this.dom.createElement('div');
            reloadIcon.classList.add('reloadIcon');
            sublimeSettingsPathContainer.appendChild(reloadIcon);
            
            if (isValid && newData.mapped.length) {
                const mappedSettingsContainer = this.dom.querySelectorThrows('#mappedSettings');
                const mappedSettings = this.settingsPage.renderMappedSettings(newData.mapped);
                for (const mappedSetting of mappedSettings) {
                    mappedSettingsContainer.appendChild(mappedSetting);
                }
            } else {
                const settingsImporter = this.dom.querySelectorThrows('#sublimeSettingsImporter');
                const noSettingsFoundContainer = this.dom.createElement('h4');
                this.dom.addClasses(noSettingsFoundContainer, 'noSettingsFound');
                if (newData && newData.mapped.length === 0) {
                    noSettingsFoundContainer.textContent = `No settings to import`;
                } else {
                    noSettingsFoundContainer.textContent = `No Sublime settings folder found`;                    
                }

                settingsImporter.appendChild(noSettingsFoundContainer);
                const settingsTable = this.dom.querySelectorThrows('#settingsTableMapper');
                settingsTable.classList.add('hidden');
            }
        } else {
            const settingsTable = this.dom.querySelectorThrows('#settingsTableMapper');
            settingsTable.classList.add('hidden');
        }
    }
}