import { JSDOM } from 'jsdom';
import * as vscode from 'vscode';
import { SettingsTable } from './settingsTable';
import { MappedSetting } from "../mappedSetting";

import { PackageEntry } from '../extensionImporter';
import { Dom } from './dom';
import { SublimeFolders } from '../sublimeFolderFinder';
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

    public addDimmer(osDefaultPaths: string[]) {
        const folderPathEl: HTMLElement = this.dom.querySelectorThrows('#dimmerNoSublimeFolderTemplate > .dimmer .folder-path')
        folderPathEl.textContent = osDefaultPaths.join('</br>');
        this.dom.addScript('dimmer.js');
    }

    public isValidSublimeSettingsPathSet() {
        return !!this.dom.getElementByIDThrows('sublimeFolderPath').textContent;
    }

    public async onNewSettingsAsync(newData: CategorizedSettings, sublimeSettingsPath: SublimeFolders): Promise<void> {
        const sublimeFolderPath = this.dom.getElementByIDThrows('sublimeFolderPath');
        sublimeFolderPath.textContent = sublimeSettingsPath.settings.fsPath;
        sublimeFolderPath.dataset.tooltip = sublimeSettingsPath.settings.fsPath;
        const trs = this.settingsPage.createTableRows(newData.mapped);
        const settingsPageDiv = this.dom.querySelectorThrows('#import-category-settings');
        const tbody: HTMLTableSectionElement = settingsPageDiv.querySelector('#sublime-settings-table tbody') as HTMLTableSectionElement;
        for (const tr of trs) {
            tbody.appendChild(tr);
        }

        // const accordion = this.createUnmappedSettingsAccordion(newData.unmapped);
        // settingsPageDiv.querySelector('#tableWrapper').appendChild(accordion);
    }

    public createPackagesList(foundPackages: PackageEntry[], parentElementId: string) {
        const cards: HTMLDivElement[] = [];

        for (const pkg of foundPackages) {
            const templateHeader: HTMLDivElement = this.dom.getTemplateCopy('#packageCardHeaderTemplate > .card');
            templateHeader.querySelector('.sublimePackageName').textContent = pkg.name;
            for (const vscodeExt of pkg["vscode-extensions"]) {
                const templateBody: HTMLDivElement = this.dom.getTemplateCopy('#packageCardBodyTemplate > .clone');
                templateBody.querySelector('.packageName').textContent = vscodeExt.name;
                templateBody.querySelector('.packageDescription').textContent = vscodeExt.description;

                const button: HTMLButtonElement = templateBody.querySelector('.addExtensionButton') as HTMLButtonElement;
                button.dataset.extensionid = vscodeExt.id;
                templateHeader.querySelector('.content').appendChild(templateBody);
            }
            cards.push(templateHeader);
        }

        const extPage = this.dom.getElementByIDThrows<HTMLElement>(parentElementId);
        cards.forEach(card => {
            extPage.appendChild(card);
        });
    }

    private createUnmappedSettingsAccordion(unmapped: MappedSetting[]): HTMLElement {
        const accordion: HTMLElement = this.dom.getTemplateCopy('#accordionTemplate > .ui.accordion');
        accordion.querySelector('.titleText').textContent = 'Settings that could not be mapped';

        const list = this.dom.createElement('div');
        this.dom.addClasses(list, 'ui list selection');

        for (const setting of unmapped) {
            const item = this.dom.createElement('div');
            this.dom.addClasses(item, 'item');
            item.textContent = setting.sublime.name;
            list.appendChild(item);
        }

        accordion.querySelector('.content').appendChild(list);
        return accordion;
    }
}