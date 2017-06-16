const vscode = require('vscode');

const messages = {
    yes: 'Yes',
    no: 'No',
    newSettingInfo: 'Sublime Text Keymap: Visual Studio Code 1.13 introduced option for using CTRL/CMD instead of ALT for multiple cursor modifier key', 
    update: 'Sublime Text Keymap: Would you like to change default ALT key to CTRL/CMD',
    updateDefault: 'Sublime Text Keymap: Multiple cursor modifier is using default ALT key',
    updateChange: 'Sublime Text Keymap: Multiple cursor modifier key was changed to CTRL/CMD',
};

// Visual Studio Code multi cursor modifier related functions and configuration values
const modifierConfigName = 'multiCursorModifier';
const modifierConfigKey = 'ctrlCmd';
const updateEditorConfig = (editorConfig) => editorConfig.update(modifierConfigName, modifierConfigKey, true);

function getEditorConfig() {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const modifierConfigValues = editorConfig.inspect(modifierConfigName);
    return { 
        editorConfig,
        modifierGlobalValue: modifierConfigValues.globalValue, 
        modifierDefaultValue: modifierConfigValues.defaultValue, 
    };
}

// Sublime Text Keymap multi cursor modifier related functions and configuration values
const sublimeConfigName = 'isMultiCursorModifierUpdated';
const sublimeConfigKeyYes = true;
const sublimeConfigKeyNo = false;
const updateSublimeKeymapConfig = (sublimeKeymapConfig, value) => sublimeKeymapConfig.update(sublimeConfigName, value, true);

function getSublimeKeymapConfig() {
    const sublimeKeymapConfig = vscode.workspace.getConfiguration('sublimeTextKeymap');
    const sublimeConfigValues = sublimeKeymapConfig.inspect(sublimeConfigName);
    return { 
        sublimeKeymapConfig, 
        sublimeGlobalValue: sublimeConfigValues.globalValue,
    };
}

// 
// Sublime Text Keymap activate function
// 

const activate = () => {
    const { modifierGlobalValue, modifierDefaultValue, editorConfig } = getEditorConfig();
    const { sublimeGlobalValue, sublimeKeymapConfig } = getSublimeKeymapConfig();

    const isSublimeModifierUpdated = sublimeGlobalValue !== undefined;
    const isEditorModifierDefault = modifierGlobalValue === modifierDefaultValue || modifierGlobalValue === undefined;
    // Show message if keymap config has not yet been updated and multi cursor modifier is set to default
    if (!isSublimeModifierUpdated && isEditorModifierDefault) {
        showMessage();
    }

    // Resolve answer promise and show message with new setting info
    function showMessage() {    
        const { yes, no, newSettingInfo, update } = messages;
        const answer = vscode.window.showInformationMessage(update, yes, no);
        
        answer.then(handleAnswer);
        
        vscode.window.showInformationMessage(newSettingInfo);
    }

    function handleAnswer(selectedOption) {
        if (selectedOption === messages.yes) {
            updateYes();
        } else if (selectedOption === messages.no) {
            updateNo();
        }
    }

    function updateYes() {
        updateEditorConfig(editorConfig);
        updateSublimeKeymapConfig(sublimeKeymapConfig, sublimeConfigKeyYes);
        vscode.window.showInformationMessage(messages.updateChange);
    }

    function updateNo() {
        updateSublimeKeymapConfig(sublimeKeymapConfig, sublimeConfigKeyNo);
        vscode.window.showInformationMessage(messages.updateDefault);
    }
}

module.exports = { activate };
