console.log('gui.js has been launched.');
start();

interface Setting {
    name: string;
    value: string;
}

function start() {
    registerEventListeners();
    initUI();
    $('.ui.accordion').accordion();
}

function initUI() {
    checkActivatedCheckboxesAndSetImportButtonState();
    const {total, numChecked} = numCheckboxesChecked();
    setSelectAllCheckboxState(total === numChecked);
}

function registerEventListeners(): void {
    const table = document.querySelector('table');

    table.addEventListener('click', function (e: MouseEvent) {
        if (e.target instanceof HTMLElement) {
            const classes: DOMTokenList = e.target.classList;

            // On selectAll click: synchronize state of checkboxes
            if (classes.contains('select_all_checkbox')) {
                const selectAllCheckbox = document.querySelector('input.select_all_checkbox') as HTMLInputElement;
                const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
                for (const chkbox of checkboxes) {
                    chkbox.checked = selectAllCheckbox.checked;
                }
                checkActivatedCheckboxesAndSetImportButtonState();
            }

            // on matching checkbox
            else if (classes.contains('matching_setting_checkbox')) {
                setSelectAllCheckboxState(false);
            }

            else if (e.target.tagName.toLowerCase() === 'td') {
                const tr = e.target.parentElement;
                if (tr.classList.contains('clickable_parent')) {
                    tr.click();
                    // checkActivatedCheckboxesAndSetImportButtonState();
                }
            }

            // parent elements of checkboxes
            else if (classes.contains('clickable_parent')) {
                const checkbox = e.target.querySelector('input') as HTMLInputElement;
                checkbox.click();
                // checkActivatedCheckboxesAndSetImportButtonState();
            }
        }
    });

    const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(box => {
        box.addEventListener('change', () => checkActivatedCheckboxesAndSetImportButtonState());
    });

    const submitButton = document.querySelector('#add-settings-button');
    submitButton.addEventListener('click', () => {
        submitButton.classList.add('loading');
        sendSettings(getAllSelectedSettings());
    });
}

function numCheckboxesChecked() {
    const checkboxes = document.querySelectorAll('input.matching_setting_checkbox') as NodeListOf<HTMLInputElement>;
    const numChecked = Array.from(checkboxes).filter((box) => box.checked).length;
    return {total: checkboxes.length, numChecked};
}

function checkActivatedCheckboxesAndSetImportButtonState() {
    setImportButtonState(numCheckboxesChecked().numChecked > 0);
}

function setImportButtonState(on: boolean) {
    const submitButton = document.querySelector('#add-settings-button');
    if (on) {
        submitButton.classList.remove('disabled');
    } else {
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

function getVscodeSettingsFromParentTR(td: Element): Setting {
    const tr: HTMLTableRowElement = td.closest('tr') as HTMLTableRowElement;
    return { name: tr.dataset.vscodename, value: tr.dataset.vscodevalue };
}

function sendSettings(selectedCheckboxes: NodeListOf<Element>): void {
    const settings = Array.from(selectedCheckboxes).map(chbox => getVscodeSettingsFromParentTR(chbox));
    sendSelectedSettingsToExtension(settings);
}

function sendSelectedSettingsToExtension(settings: Setting[]) {
    const obj = {
        data: settings
    };
    executeCommand('command:extension.selectedSettingsFromGUI?' + JSON.stringify(obj));
}