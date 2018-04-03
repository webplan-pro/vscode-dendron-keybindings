function addClasses(el: HTMLElement, classesWhiteSpaceSeparated: string): void {
    classesWhiteSpaceSeparated.split(' ').forEach(cls => el.classList.add(cls));
}
class Setting {
    constructor(readonly name: string, readonly value: any) { }
}

class MappedSetting {
    public static hasNoMatch(setting: MappedSetting): boolean {
        if (setting && setting.vscode) {
            return setting.vscode.name === MappedSetting.NO_MATCH;
        }
        return true;
    }

    private static readonly NO_MATCH: string = "--No Match--";
    public sublime: Setting;
    public vscode: Setting;
    public isDuplicate: boolean = false;
    public duplicateVscodeSetting: Setting;

    constructor(sublimeSetting: Setting, vscodeSetting?: Setting) {
        this.sublime = sublimeSetting;
        this.vscode = vscodeSetting || new Setting(MappedSetting.NO_MATCH, MappedSetting.NO_MATCH);
    }

    public setVscode(setting: Setting): void {
        this.vscode = setting;
    }

    public markAsDuplicate(vscodeSetting: Setting) {
        this.isDuplicate = true;
        this.duplicateVscodeSetting = vscodeSetting;
    }
}

class SettingsTable {

    public renderMappedSettings(mappedSettings: MappedSetting[]): HTMLElement[] {
        return mappedSettings.filter(m => !MappedSetting.hasNoMatch(m)).map((m, index) => this.renderMappedSetting(m, index));
    }

    private renderMappedSetting(setting: MappedSetting, index: number): HTMLElement {
        let settingRow = document.createElement('div');
        addClasses(settingRow, 'settingRow clickable_parent');
        if (index % 2 === 0) {
            addClasses(settingRow, 'odd');
        }
        settingRow.dataset.sublimename = setting.sublime.name;
        settingRow.dataset.sublimevalue = JSON.stringify(setting.sublime.value);
        settingRow.dataset.vscodename = setting.vscode.name;
        settingRow.dataset.vscodevalue = JSON.stringify(setting.vscode.value);

        settingRow.appendChild(this.renderCheckbox(setting));
        settingRow.appendChild(this.renderSetting(setting));
        return settingRow;
    }

    private renderCheckbox(setting: MappedSetting) {
        const checkbox: HTMLInputElement = document.createElement('input') as HTMLInputElement;
        checkbox.type = 'checkbox';
        if (!setting.isDuplicate) {
            checkbox.setAttribute('checked', '');
        }
        addClasses(checkbox, 'ui checkbox matching_setting_checkbox');
        const td = document.createElement('div');
        td.appendChild(checkbox);
        return td;
    }

    private renderSetting(setting: MappedSetting): HTMLElement {
        const mappedSetting = document.createElement('div');
        addClasses(mappedSetting, 'mappedSetting');
        mappedSetting.appendChild(this.renderSublimeSetting(setting.sublime));
        mappedSetting.appendChild(this.renderVscodeSetting(setting.vscode, setting.duplicateVscodeSetting));
        return mappedSetting;
    }

    private renderSublimeSetting(sublime: Setting): HTMLElement {
        const setting = document.createElement('div');
        addClasses(setting, 'sublimeSetting');
        setting.appendChild(this.renderSettingNameAndValue(sublime.name, sublime.value));
        return setting;
    }

    private renderVscodeSetting(vscode: Setting, existingSetting?: Setting): HTMLElement {
        const setting = document.createElement('div');
        addClasses(setting, 'vscodeSetting');
        setting.appendChild(this.renderSettingNameAndValue(vscode.name, vscode.value, existingSetting ? existingSetting.value : undefined));
        return setting;
    }

    private renderSettingNameAndValue(name: string, value: string | boolean | number, currVal?: string | boolean | number): HTMLElement {
        const setting = document.createElement('div');
        addClasses(setting, 'setting-name-value');
        const nameContainer = document.createElement('div');
        addClasses(nameContainer, 'setting-name');
        nameContainer.textContent = name;
        nameContainer.title = name;
        setting.appendChild(nameContainer);
        const valueContainer = document.createElement('div');
        addClasses(valueContainer, 'setting-value');
        valueContainer.textContent = value.toString();
        valueContainer.title = value.toString();
        setting.appendChild(valueContainer);
        if (currVal !== undefined) {
            const warningIcon = document.createElement('div');
            addClasses(warningIcon, 'warning');
            warningIcon.title = `Overwrites current value: ${currVal}`;
            valueContainer.appendChild(warningIcon);
        }

        return setting;
    }
}

class Frontend {
    private selectAllCheckbox: HTMLInputElement = document.querySelector('#selectAllCheckbox input') as HTMLInputElement;
    private checkboxes: HTMLInputElement[] = Array.from(document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>);
    private submitButton: HTMLButtonElement = document.querySelector('#add-settings-button') as HTMLButtonElement;
    private browseButton: HTMLButtonElement = document.querySelector('.browseButton') as HTMLButtonElement;
    private reloadIcon: HTMLDivElement = document.querySelector('.reloadIcon') as HTMLDivElement;
    private settingsPathContainer: HTMLInputElement = document.getElementById('settingsPathContainer') as HTMLInputElement;

    constructor() {
        this.registerEventListeners();
        this.initUI();
    }

    private registerEventListeners(): void {
        this.selectAllCheckbox.addEventListener('click', () => this.onDidClickSelectAllCheckbox());

        this.checkboxes.forEach(box => box.addEventListener('change', () => this.refreshStates()));

        this.submitButton.addEventListener('click', () => this.sendSettings(this.checkboxes.filter(chkbox => chkbox.checked)));

        this.browseButton.addEventListener('click', () => this.executeCommand('command:extension.onBrowseButtonClicked'));

        this.reloadIcon.addEventListener('click', () => this.executeCommand('command:extension.reload?' + JSON.stringify(this.settingsPathContainer.value)));
    }

    private onDidClickSelectAllCheckbox() {
        for (const chkbox of this.checkboxes) {
            chkbox.checked = this.selectAllCheckbox.checked;
        }
        this.refreshStates();
    }

    private initUI() {
        this.refreshStates();
        const { total, numChecked } = this.numCheckboxesChecked();
        this.selectAllCheckbox.checked = total === numChecked;
    }

    private numCheckboxesChecked() {
        const numChecked = this.checkboxes.filter((box) => box.checked).length;
        return { total: this.checkboxes.length, numChecked };
    }

    private refreshStates() {
        const chkboxStates = this.numCheckboxesChecked();
        this.setImportButtonState(chkboxStates.numChecked > 0);
        this.selectAllCheckbox.checked = chkboxStates.numChecked === chkboxStates.total;
    }

    private setImportButtonState(on: boolean) {
        if (on) {
            this.submitButton.removeAttribute('disabled');
            this.submitButton.classList.remove('disabled');
        } else {
            this.submitButton.setAttribute('disabled', '');
            this.submitButton.classList.add('disabled');
        }
    }

    private getVscodeSettingsFromParentTR(td: HTMLElement): Setting {
        return { name: td.parentElement.parentElement.dataset.vscodename, value: td.parentElement.parentElement.dataset.vscodevalue };
    }

    private sendSettings(selectedCheckboxes: HTMLInputElement[]): void {
        const settings = selectedCheckboxes.map(chbox => this.getVscodeSettingsFromParentTR(chbox as HTMLElement));
        this.sendSelectedSettingsToExtension(settings);
    }

    private sendSelectedSettingsToExtension(settings: Setting[]) {
        const obj = {
            data: settings
        };
        this.executeCommand('command:extension.onImportSelectedSettings?' + JSON.stringify(obj));
    }

    private executeCommand(cmd: string): void {
        const command = encodeURI(cmd);
        var anchor = document.createElement('a');
        anchor.href = command;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}

function onNewSettings(settingsTable: SettingsTable) {
    const { mappedSettings, sublimeSettingsPath, isValid } = JSON.parse(decodeURI(document.getElementById('frontendData').dataset.frontend));
    if (sublimeSettingsPath) {
        const sublimeSettingsPathContainer = document.getElementById('settingsPathContainer');
        sublimeSettingsPathContainer.title = sublimeSettingsPath;
        sublimeSettingsPathContainer.setAttribute('value', sublimeSettingsPath);

        if (isValid && mappedSettings.length) {
            const mappedSettingsContainer = document.querySelector('#mappedSettings');
            const mappedSettingsEls = settingsTable.renderMappedSettings(mappedSettings);
            for (const mappedSetting of mappedSettingsEls) {
                mappedSettingsContainer.appendChild(mappedSetting);
            }
        } else {
            const settingsImporter = document.querySelector('#sublimeSettingsImporter');
            const noSettingsFoundContainer = document.createElement('h4');
            addClasses(noSettingsFoundContainer, 'noSettingsFound');
            if (mappedSettings.length === 0) {
                noSettingsFoundContainer.textContent = `No settings to import`;
            } else {
                noSettingsFoundContainer.textContent = `No Sublime settings folder found`;
            }

            settingsImporter.appendChild(noSettingsFoundContainer);
            const settingsTable = document.querySelector('#settingsTableMapper');
            settingsTable.classList.add('hidden');
        }
    } else {
        const settingsTable = document.querySelector('#settingsTableMapper');
        settingsTable.classList.add('hidden');
    }
}

onNewSettings(new SettingsTable());
new Frontend();