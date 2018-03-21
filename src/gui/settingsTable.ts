import { MappedSetting } from "../mappedSetting";
import { Dom } from "./dom";


export class SettingsTable {

    constructor(private dom: Dom) { }

    public createTableRows(mappedSettings: MappedSetting[]): HTMLTableRowElement[] {
        let trs: HTMLTableRowElement[] = mappedSettings.map(this.createTR, this);
        return trs;
    }

    createTR(setting: MappedSetting): HTMLTableRowElement {
        let tr = this.dom.createElement<HTMLTableRowElement>('tr');
        tr.dataset.sublimename = setting.sublime.name;
        tr.dataset.sublimevalue = setting.sublime.value.toString();
        tr.dataset.vscodename = setting.vscode.name;
        tr.dataset.vscodevalue = setting.vscode.value.toString();

        if (MappedSetting.hasNoMatch(setting)) {
            tr.classList.add('disabled');
            tr.appendChild(this.dom.createElement<HTMLTableDataCellElement>('td'));
        }
        else {
            const checkbox: HTMLInputElement = this.dom.createElement<HTMLInputElement>('input');
            checkbox.type = 'checkbox';
            this.dom.addClasses(checkbox, 'ui checkbox matching_setting_checkbox')
            const td = this.dom.createElement<HTMLTableDataCellElement>('td');
            td.appendChild(checkbox);
            tr.appendChild(td);
            tr.classList.add('clickable_parent');
        }

        tr.appendChild(this.createSettingsTD(`${setting.sublime.name}: `, 'sublime-name setting-name'));
        tr.appendChild(this.createSettingsTD(setting.sublime.value.toString(), 'sublime-value setting-value'));
        const arrowTD = this.dom.createElement('td');
        const iconI = this.dom.createElement('i');
        this.dom.addClasses(iconI, 'mapping-arrow long arrow alternate right icon');
        arrowTD.appendChild(iconI);
        tr.appendChild(arrowTD);

        const vscodeNameTD = this.createSettingsTD(`${setting.vscode.name}: `, 'vscode-name setting-name');
        const vscodeValueTD = this.createSettingsTD(setting.vscode.value.toString(), 'vscode-value setting-value');

        if (setting.isDuplicate) {
            tr.classList.add('warning');
            const warningIcon = this.dom.getTemplateCopy('#duplicateVsCodeWarningIconTemplate > .duplicate-label');
            warningIcon.dataset.tooltip = `Overwrites current value: ${setting.duplicateVscodeSetting.value}`;
            vscodeValueTD.appendChild(warningIcon);
        }

        tr.appendChild(vscodeNameTD);
        tr.appendChild(vscodeValueTD);

        return tr;
    }

    private createSettingsTD(txt: string, clsWhitespaceSeparated: string): HTMLTableDataCellElement {
        const td = this.dom.createElement<HTMLTableDataCellElement>('td');
        this.dom.addClasses(td, clsWhitespaceSeparated);
        const span = this.dom.createElement<HTMLSpanElement>('span');
        span.textContent = txt;
        td.appendChild(span);
        return td;
    }
}