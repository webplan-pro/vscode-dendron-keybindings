import { JSDOM } from 'jsdom';
import * as vscode from 'vscode';
import { SettingsTable } from './settingsTable';
import { MappedSetting } from "../mappedSetting";

import { PackageEntry } from '../extensionImporter';
import { Dom } from './dom';

class CategorizedSettings {
    mapped: MappedSetting[] = [];
    unmapped: MappedSetting[] = [];
}
export class HTMLCreator {
    private settingsPage: SettingsTable;
    private dom: Dom;

    private constructor() { }

    public static async initAsync(projectRoot: vscode.Uri) {
        const instance: HTMLCreator = new HTMLCreator();
        instance.init(projectRoot);
        return instance;
    }

    private async init(projectRoot: vscode.Uri) {
        this.dom = await Dom.initAsync(projectRoot);
        this.settingsPage = new SettingsTable(this.dom);        
    }

    public async resetHTML() {
        return this.dom.getHtmlAsync(true);
    }

    public async getHtmlAsync(): Promise<JSDOM> {
        return this.dom.getHtmlAsync();
    }

    public async onNewSettingsAsync(newData): Promise<void> {
        const sortedSettings: CategorizedSettings = this.categorizeAndSortSettings(newData);
        const trs = this.settingsPage.createTableRows(sortedSettings.mapped);
        const settingsPageDiv = this.dom.querySelectorThrows('#import-category-settings');
        const tbody: HTMLTableSectionElement = settingsPageDiv.querySelector<HTMLTableSectionElement>('#dynamic-table--sublime-settings tbody');
        for (const tr of trs) {
            tbody.appendChild(tr);
        }

        const accordion = this.createUnmappedSettingsAccordion(sortedSettings.unmapped);
        settingsPageDiv.querySelector('#tableWrapper').appendChild(accordion);
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

    private categorizeAndSortSettings(settings: MappedSetting[]): CategorizedSettings {
        const sep: CategorizedSettings = settings.reduce((prev, curr) => {
            if (MappedSetting.hasNoMatch(curr)) {
                prev.unmapped.push(curr);
            } else {
                prev.mapped.push(curr);
            }
            return prev;
        }, new CategorizedSettings());

        sep.mapped.sort((a, b) => a.sublime.name.localeCompare(b.sublime.name));
        sep.unmapped.sort((a, b) => a.sublime.name.localeCompare(b.sublime.name));

        return sep;
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