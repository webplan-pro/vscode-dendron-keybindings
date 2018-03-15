import { MappedSetting } from "../mappedSetting";
import { Dom } from "./dom";


export class SettingsTable {
    constructor(private dom: Dom) { }

    public createTableRows(mappedSettings: MappedSetting[]): HTMLTableRowElement[] {
        let trs: HTMLTableRowElement[] = this.createTRs(mappedSettings);
        return trs;
    }

    createTRs(mapped: MappedSetting[]): HTMLTableRowElement[] {
        let trs: HTMLTableRowElement[] = mapped.map(this.createTR, this);
        return trs;
    }

    createTR(setting: MappedSetting): HTMLTableRowElement {
        let tr = this.dom.createElement<HTMLTableRowElement>('tr');
        tr.dataset.sublimename = setting.sublime.name;
        tr.dataset.sublimevalue = setting.sublime.value;
        tr.dataset.vscodename = setting.vscode.name;
        tr.dataset.vscodevalue = setting.vscode.value;

        if (MappedSetting.hasNoMatch(setting)) {
            tr.classList.add('disabled');
            tr.appendChild(this.createFirstColumnTD());
        }
        else {
            const checkbox: HTMLInputElement = this.dom.createElement<HTMLInputElement>('input');
            checkbox.type = 'checkbox';
            this.dom.addClasses(checkbox, 'ui checkbox matching_setting_checkbox')
            const td = this.createFirstColumnTD();
            td.appendChild(checkbox);
            tr.appendChild(td);
            tr.classList.add('clickable_parent');
        }

        tr.appendChild(this.createSettingsTD(setting.sublime.name, setting.sublime.value, 'sublime-name'));
        const vscodeValueTD = this.createSettingsTD(setting.vscode.name, setting.vscode.value, 'vscode-name');

        if (setting.isDuplicate) {
            tr.classList.add('warning');
            const duplicateDiv = this.dom.createElement('div');
            this.dom.addClasses(duplicateDiv, 'ui warning mini compact message duplicate-label');
            duplicateDiv.textContent = `Current value: ${setting.duplicateVscodeSetting.value}`;
            vscodeValueTD.appendChild(duplicateDiv)
        }
        tr.appendChild(vscodeValueTD);

        return tr;
    }

    private createFirstColumnTD() {
        const td = this.dom.createElement<HTMLTableDataCellElement>('td');
        return td;
    }

    private createSettingsTD(name: string, value: string, cls: string): HTMLTableDataCellElement {
        const td = this.dom.createElement<HTMLTableDataCellElement>('td');
        td.classList.add(cls);
        const code = this.dom.createElement<HTMLElement>('code');
        this.dom.addClasses(code, 'code less');
        const settingNameEl = this.dom.createElement<HTMLSpanElement>('span');
        this.dom.addClasses(settingNameEl, 'variable');
        settingNameEl.textContent = `${name}: `;
        const settingValueEl = this.dom.createElement<HTMLSpanElement>('span');
        settingValueEl.textContent = value;

        code.appendChild(settingNameEl);
        code.appendChild(settingValueEl);
        td.appendChild(code);
        return td;
    }
}