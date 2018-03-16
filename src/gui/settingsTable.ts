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

        tr.appendChild(this.createSettingsTD(setting.sublime.name, setting.sublime.value.toString(), 'sublime-name'));
        const vscodeValueTD = this.createSettingsTD(setting.vscode.name, setting.vscode.value.toString(), 'vscode-name');

        if (setting.isDuplicate) {
            // tr.classList.add('warning');
            const duplicateDiv = this.dom.createElement('div');
            // this.dom.addClasses(duplicateDiv, 'ui warning mini compact message duplicate-label');
            this.dom.addClasses(duplicateDiv, 'ui left pointing basic label');
            duplicateDiv.textContent = `Current value: ${setting.duplicateVscodeSetting.value}`;
            vscodeValueTD.querySelector('.settingValue').appendChild(duplicateDiv);
        }
        tr.appendChild(vscodeValueTD);

        return tr;
    }

    private createSettingsTD(name: string, value: string, cls: string): HTMLTableDataCellElement {
        const td = this.dom.createElement<HTMLTableDataCellElement>('td');
        td.classList.add(cls);
        const code = this.dom.createElement<HTMLElement>('div');
        // const code = this.dom.createElement<HTMLElement>('code');
        // this.dom.addClasses(code, 'code less');
        const settingNameEl = this.dom.createElement<HTMLSpanElement>('span');
        this.dom.addClasses(settingNameEl, 'settingName');
        settingNameEl.textContent = `${name}: `;
        const settingValueEl = this.dom.createElement<HTMLSpanElement>('span');
        this.dom.addClasses(settingValueEl, 'settingValue');
        settingValueEl.textContent = value;

        code.appendChild(settingNameEl);
        code.appendChild(settingValueEl);
        td.appendChild(code);
        return td;
    }
}