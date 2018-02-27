console.log('gui.js has been launched.');
start();

/**
 * Cannot import Setting since gui can't be a commonjs module
 */
class Setting {
    constructor(public name: string, public value: string) { }
}

function start() {
    registerEventListeners();
}

function registerEventListeners(): void {
    const submitButton = document.querySelector('#submit');
    submitButton.addEventListener('click', (e: MouseEvent) => {
        sendSettings(getAllSelectedSettings());
    });

    document.querySelector('input.select_all_checkbox').addEventListener('change', function (e: MouseEvent) {
        const checkboxes = <NodeListOf<HTMLInputElement>>document.querySelectorAll('input.setting_checkbox');
        for (const chkbox of checkboxes) {
            chkbox.checked = this.checked;
        }
    });

    // Deselect master checkbox' once another checkbox has been clicked
    const checkboxes = Array.from(<NodeListOf<HTMLInputElement>>document.querySelectorAll('input.setting_checkbox'));
    for (const chkbox of checkboxes) {
        chkbox.addEventListener('change', function (e: MouseEvent) {
            const selectAllCheckbox = <HTMLInputElement>document.querySelector('input.select_all_checkbox');
            selectAllCheckbox.checked = false;
        });
    }
}

function getAllSelectedSettings(): NodeListOf<Element> {
    const selectAllCheckbox = <HTMLInputElement>document.querySelector('input.select_all_checkbox');
    let selectedCheckboxes;
    if (selectAllCheckbox.checked) {
        selectedCheckboxes = document.querySelectorAll('input.setting_checkbox');
    } else {
        selectedCheckboxes = document.querySelectorAll('input.setting_checkbox:checked');
    }
    return selectedCheckboxes;
}

function getVscodeSettingsFromParentTR(td: Element) {
    const tr = td.closest('tr');
    return new Setting(tr.dataset.vscodename, tr.dataset.vscodevalue);
}

function sendSettings(selectedCheckboxes: NodeListOf<Element>): void {
    Array.from(selectedCheckboxes).forEach(chbox => {
        const setting = getVscodeSettingsFromParentTR(chbox);
        sendToExtension(setting);
    });

    const showUserSettingsChkbox = <HTMLInputElement>document.querySelector('#chkbox_show_settings');
    if (showUserSettingsChkbox.checked) {
        executeCommand('command:workbench.action.openGlobalSettings');
    }

    if (selectedCheckboxes.length) {
        document.querySelector('#success_import_message').textContent = 'Settings import done.';
    }
}

function sendToExtension(setting: Setting) {
    executeCommand('command:extension.getResponseFromGUI?' + JSON.stringify(setting));
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