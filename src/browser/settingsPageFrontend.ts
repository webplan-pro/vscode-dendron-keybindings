console.log('gui.js has been launched.');

interface Setting {
    name: string;
    value: string;
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

        this.browseButton.addEventListener('click', () => this.executeCommand('command:extension.userClickedOnBrowseButtonFromGUI'));

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
        this.executeCommand('command:extension.selectedSettingsFromGUI?' + JSON.stringify(obj));
    }

    private executeCommand(cmd: string): void {
        const command = encodeURI(cmd);
        console.log(command);
        var anchor = document.createElement('a');
        anchor.href = command;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}

new Frontend();