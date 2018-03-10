import { MappedSetting } from "../mappedSetting";
import { JSDOM } from 'jsdom';
import * as vscode from 'vscode';
import { nfcall as promisifier } from '../filesystem';
import * as fs from 'fs';

class MappedUnmappedSettings {
    mapped: MappedSetting[] = [];
    unmapped: MappedSetting[] = [];
}

export class HTMLCreator {
    private projectRoot: vscode.Uri;
    private _html: JSDOM;

    constructor(projectRoot: vscode.Uri) {
        this.projectRoot = projectRoot;
        this._html = null;
    }

    async getHtmlAsync(reset?: boolean): Promise<JSDOM> {
        if (this._html && !reset) {
            return this._html;
        }
        else {
            let htmlPath = vscode.Uri.file(this.projectRoot.fsPath + '/resources/content.html');
            const htmlContent: string = await promisifier<string>(fs.readFile, htmlPath.fsPath, 'utf8');
            const replacedHTMLContent: string = htmlContent.replace(/\$\$ABS_PATH_TO_ROOT\$\$/g, this.projectRoot.fsPath);
            this._html = new JSDOM(replacedHTMLContent);
            return this._html;
        }
    }

    createTable(newData: MappedSetting[], doc: JSDOM): JSDOM {
        let trs: HTMLTableRowElement[] = this.createTRs(newData);
        const tbody: HTMLTableSectionElement = doc.window.document.querySelector('tbody');
        for (const tr of trs) {
            tbody.appendChild(tr);
        }
        this._html = doc;
        return doc;
    }

    createTRs(settings: MappedSetting[]): HTMLTableRowElement[] {
        const { mapped, unmapped } = this.sortMappedSettings(settings);
        let trs: HTMLTableRowElement[] = mapped.map(this.createTR, this);
        return trs.concat(unmapped.map(this.createTR, this));
    }

    createTR(setting: MappedSetting): HTMLTableRowElement {
        let tr = this.createElement<HTMLTableRowElement>('tr');
        tr.dataset.sublimename = setting.sublime.name;
        tr.dataset.sublimevalue = setting.sublime.value;
        tr.dataset.vscodename = setting.vscode.name;
        tr.dataset.vscodevalue = setting.vscode.value;

        if (MappedSetting.hasNoMatch(setting)) {
            tr.classList.add('disabled');
            tr.appendChild(this.createTD());
        }
        else {
            const checkbox: HTMLInputElement = this.createElement<HTMLInputElement>('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('matching_setting_checkbox');
            const td = this.createTD();
            td.appendChild(checkbox);
            tr.appendChild(td);
            tr.classList.add('clickable_parent');
        }

        tr.appendChild(this.createTD(setting.sublime.name, 'sublime-name'));
        tr.appendChild(this.createTD(setting.sublime.value, 'sublime-value'));
        tr.appendChild(this.createTD(setting.vscode.name, 'vscode-name'));
        tr.appendChild(this.createTD(setting.vscode.value, 'vscode-value'));

        if (setting.isDuplicate) {
            this.applyDuplicateStyle(tr, setting.duplicateVscodeSetting);
        }

        return tr;
    }

    private applyDuplicateStyle(tr: HTMLTableRowElement, setting: Setting) {
        tr.classList.add('warning');
        const td = tr.querySelector('.vscode-value');
        const duplicateLabel = this.createElement<HTMLDivElement>('div');
        this.addClasses(duplicateLabel, 'duplicate-label ui orange horizontal label');
        duplicateLabel.appendChild(this.createTextNode('Existing setting:'));
        duplicateLabel.appendChild(this.createElement('br'));
        duplicateLabel.appendChild(this.createTextNode(`${setting.name}: ${setting.value}`));
        td.appendChild(duplicateLabel);
    }

    private createElement<T extends HTMLElement>(name: string): T {
        return <T>this._html.window.document.createElement(name);
    }

    private createTextNode(txt: string): Text {
        return this._html.window.document.createTextNode(txt);
    }

    private addClasses(el: HTMLElement, classesWhiteSpaceSeparated: string) {
        classesWhiteSpaceSeparated.split(' ').forEach(cls => el.classList.add(cls));
    }

    private sortMappedSettings(settings: MappedSetting[]): MappedUnmappedSettings {
        const sep: MappedUnmappedSettings = settings.reduce((prev, curr) => {
            if (MappedSetting.hasNoMatch(curr)) {
                prev.unmapped.push(curr);
            } else {
                prev.mapped.push(curr);
            }
            return prev;
        }, new MappedUnmappedSettings());

        sep.mapped.sort((a, b) => {
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        sep.unmapped.sort((a, b) => {
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        return sep;
    }

    private createTD(val: string = '', cls?: string): HTMLTableDataCellElement {
        const td = this.createElement<HTMLTableDataCellElement>('td');
        if (cls) {
            td.classList.add(cls);
        }
        if (val) {
            td.appendChild(this._html.window.document.createTextNode(val));
        }
        return td;
    }
}