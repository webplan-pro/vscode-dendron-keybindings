console.log('gui.js has been launched.');
registerEventListeners();

/**
 * Cannot import Setting since gui can't be a commonjs module
 */
class Setting {
    constructor(public name: string, public value: string) { }
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

    // Deselect 'select all checkbox' once another checkbox has been clicked
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

function sendSettings(selectedCheckboxes: NodeListOf<Element>): void {
    Array.from(selectedCheckboxes).forEach(chbox => {
        const tr = chbox.closest('tr');
        sendToExtension(new Setting(tr.dataset.name, tr.dataset.value));
    });
}

function sendToExtension(setting: Setting): void {
    const command = encodeURI('command:extension.getResponseFromGUI?' + JSON.stringify(setting));
    console.log(command);
    var anchor = document.createElement('a');
    anchor.href = command;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}