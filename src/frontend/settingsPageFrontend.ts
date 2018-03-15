console.log('gui.js has been launched.');
start();

/**
 * TODO: Cannot import Setting since gui can't be a commonjs module
 */
interface Setting {
    name: string;
    value: string;
}

function start() {
    registerEventListeners();
    // @ts-ignore
    $('.ui.accordion').accordion();
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
            }

            // on matching checkbox
            else if (classes.contains('matching_setting_checkbox')) {
                deselectAllCheckbox();
            }

            else if (e.target.tagName.toLowerCase() === 'td') {
                const tr = e.target.parentElement;
                if (tr.classList.contains('clickable_parent')) {
                    tr.click();
                }
            }

            // parent elements of checkboxes
            else if (classes.contains('clickable_parent')) {
                const checkbox = e.target.querySelector('input') as HTMLInputElement;
                checkbox.click();
            }
        }
    });

    const submitButton = document.querySelector('#add-settings-button');
    submitButton.addEventListener('click', () => {
        sendSettings(getAllSelectedSettings());
    });

}

function deselectAllCheckbox() {
    const selectAllCheckbox = document.querySelector('input.select_all_checkbox') as HTMLInputElement;
    selectAllCheckbox.checked = false;
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
    executeCommand('command:extension.responseFromGUI?' + JSON.stringify(setting));
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