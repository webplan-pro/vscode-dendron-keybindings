import { MappedSetting } from "../mappedSetting";
import { Dom } from "./dom";
import { Setting } from '../setting';


export class SettingsTable {

    constructor(private dom: Dom) { }

    public renderMappedSettings(mappedSettings: MappedSetting[]): HTMLElement[] {
        return mappedSettings.filter(m => !MappedSetting.hasNoMatch(m)).map((m, index) => this.renderMappedSetting(m, index));
    }

    private renderMappedSetting(setting: MappedSetting, index: number): HTMLElement {
        let settingRow = this.dom.createElement('div');
        this.dom.addClasses(settingRow, 'settingRow clickable_parent');
        if (index%2 === 0) {
            this.dom.addClasses(settingRow, 'odd');
        }
        settingRow.dataset.sublimename = setting.sublime.name;
        settingRow.dataset.sublimevalue = setting.sublime.value.toString();
        settingRow.dataset.vscodename = setting.vscode.name;
        settingRow.dataset.vscodevalue = setting.vscode.value.toString();

        settingRow.appendChild(this.renderCheckbox(setting));
        settingRow.appendChild(this.renderSetting(setting));
        return settingRow;
    }

    private renderCheckbox(setting: MappedSetting) {
        const checkbox: HTMLInputElement = this.dom.createElement<HTMLInputElement>('input');
        checkbox.type = 'checkbox';
        if (!setting.isDuplicate) {
            checkbox.setAttribute('checked', '');
        }
        this.dom.addClasses(checkbox, 'ui checkbox matching_setting_checkbox');
        const td = this.dom.createElement('div');
        td.appendChild(checkbox);
        return td;
    }

    private renderSetting(setting: MappedSetting): HTMLElement {
        const mappedSetting = this.dom.createElement('div');
        this.dom.addClasses(mappedSetting, 'mappedSetting');
        mappedSetting.appendChild(this.renderSublimeSetting(setting.sublime));
        mappedSetting.appendChild(this.renderVscodeSetting(setting.vscode, setting.duplicateVscodeSetting));
        return mappedSetting;
    }
    
    private renderSublimeSetting(sublime: Setting): HTMLElement {
        const setting = this.dom.createElement('div');
        this.dom.addClasses(setting, 'sublimeSetting');
        setting.appendChild(this.renderSettingNameAndValue(sublime.name, sublime.value));
        return setting;
    }

    private renderVscodeSetting(vscode: Setting, existingSetting?: Setting): HTMLElement {
        const setting = this.dom.createElement('div');
        this.dom.addClasses(setting, 'vscodeSetting');
        setting.appendChild(this.renderSettingNameAndValue(vscode.name, vscode.value, existingSetting ? existingSetting.value : undefined));
        return setting;
    }

    private renderSettingNameAndValue(name: string, value: string | boolean, currVal?: string | boolean): HTMLElement {
        const setting = this.dom.createElement('div');
        this.dom.addClasses(setting, 'setting-name-value');
        const nameContainer = this.dom.createElement('div');
        this.dom.addClasses(nameContainer, 'setting-name');
        nameContainer.textContent = name;
        nameContainer.title = name;
        setting.appendChild(nameContainer);
        const valueContainer = this.dom.createElement('div');
        this.dom.addClasses(valueContainer, 'setting-value');
        valueContainer.textContent = value.toString();
        valueContainer.title = value.toString();
        setting.appendChild(valueContainer);
        if (currVal !== undefined) {
            const warningIcon = this.dom.createElement('div');
            this.dom.addClasses(warningIcon, 'warning');
            warningIcon.title = `Overwrites current value: ${currVal}`;
            valueContainer.appendChild(warningIcon);
        }
        
        return setting;
    }
}