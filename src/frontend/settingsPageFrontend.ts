console.log('gui.js has been launched.');
start();

interface Setting {
    name: string;
    value: string;
}

function start() {
    registerEventListeners();
    initUI();
}

function initUI() {
    checkActivatedCheckboxesAndSetImportButtonState();
    const { total, numChecked } = numCheckboxesChecked();
    setSelectAllCheckboxState(total === numChecked);
}

function registerEventListeners(): void {
    const selectAllCheckbox = document.querySelector('#selectAllCheckbox');

    selectAllCheckbox.addEventListener('click', function () {
        const selectAllCheckbox = document.querySelector('input.select_all_checkbox') as HTMLInputElement;
        const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
        for (const chkbox of checkboxes) {
            chkbox.checked = selectAllCheckbox.checked;
        }
        checkActivatedCheckboxesAndSetImportButtonState();
    });

    const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(box => {
        box.addEventListener('change', () => checkActivatedCheckboxesAndSetImportButtonState());
        setSelectAllCheckboxState(false);
    });

    const submitButton = document.querySelector('#add-settings-button');
    submitButton.addEventListener('click', () => {
        // submitButton.classList.add('loading');
        sendSettings(getAllSelectedSettings());
    });

    document.querySelector('.browseButton').addEventListener('click', () => {
        executeCommand('command:extension.userClickedOnBrowseButtonFromGUI');
    });
}

function numCheckboxesChecked() {
    const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
    const numChecked = Array.from(checkboxes).filter((box) => box.checked).length;
    return { total: checkboxes.length, numChecked };
}

function checkActivatedCheckboxesAndSetImportButtonState() {
    setImportButtonState(numCheckboxesChecked().numChecked > 0);
}

function setImportButtonState(on: boolean) {
    const submitButton = document.querySelector('#add-settings-button');
    if (on) {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('disabled');
    } else {
        submitButton.setAttribute('disabled', '');
        submitButton.classList.add('disabled');
    }
}

function setSelectAllCheckboxState(on: boolean) {
    const selectAllCheckbox = document.querySelector('input.select_all_checkbox') as HTMLInputElement;
    selectAllCheckbox.checked = on;
}

function getAllSelectedSettings(): NodeListOf<Element> {
    const selectAllCheckbox = <HTMLInputElement>document.querySelector('input.select_all_checkbox');
    let selectedCheckboxes;
    if (selectAllCheckbox.checked) {
        selectedCheckboxes = document.querySelectorAll('input.matching_setting_checkbox');
    } else {
        selectedCheckboxes = document.querySelectorAll('input.matching_setting_checkbox:checked');
    }
    return selectedCheckboxes;
}

function getVscodeSettingsFromParentTR(td: HTMLElement): Setting {
    return { name: td.parentElement.parentElement.dataset.vscodename, value: td.parentElement.parentElement.dataset.vscodevalue };
}

function sendSettings(selectedCheckboxes: NodeListOf<Element>): void {
    const settings = Array.from(selectedCheckboxes).map(chbox => getVscodeSettingsFromParentTR(chbox as HTMLElement));
    sendSelectedSettingsToExtension(settings);
}

function sendSelectedSettingsToExtension(settings: Setting[]) {
    const obj = {
        data: settings
    };
    executeCommand('command:extension.selectedSettingsFromGUI?' + JSON.stringify(obj));
}

function executeCommand(cmd: string): void {
    const command = encodeURI(cmd);
    console.log(command);
    var anchor = document.createElement('a');
    anchor.href = command;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}