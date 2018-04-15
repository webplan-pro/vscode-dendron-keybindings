import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';

const showInformationMessage = vscode.window.showInformationMessage;
const isGlobalConfigValue = true;

export function start(): void {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const updateSetting = new VersionThreeUpdateSetting();

    if (!updateSetting.hasPrompted && isDefaultValueSet(editorConfig, versionThreeSettings)) {
        new View(updateSetting, editorConfig).showMessage();
    }
}

class Setting {
    constructor(public name: string, public value: any) { }
}

const versionThreeSettings = [
    new Setting('multiCursorModifier', 'ctrlCmd'),
    new Setting('snippetSuggestions', 'top'),
    new Setting('formatOnPaste', true),
];

function updateSettings(editorConfig: WorkspaceConfiguration, settings: Setting[]): void {
    settings.forEach((setting) => {
        editorConfig.update(setting.name, setting.value, isGlobalConfigValue);
    });
}

function isDefaultValueSet(editorConfig: WorkspaceConfiguration, settings: Setting[]): boolean {
    for (const setting of settings) {
        const info = editorConfig.inspect(setting.name);
        const defaultValue = info ? info.defaultValue : null;
        const globalValue = info ? info.globalValue : null;

        if (globalValue === defaultValue || globalValue === undefined) {
            return true;
        }
    }

    return false;
}

class VersionThreeUpdateSetting {
    public readonly hasPrompted: boolean;
    private name: string;
    private config: WorkspaceConfiguration;
    constructor() {
        this.name = 'promptV3Features';
        this.config = vscode.workspace.getConfiguration('sublimeTextKeymap');
        this.hasPrompted = this.config.get(this.name) || false;
    }

    public async persist(): Promise<void> {
        return this.config.update(this.name, true, isGlobalConfigValue);
    }

}

class View {
    private messages: { [key: string]: string } = {
        yes: 'Yes',
        no: 'No',
        learnMore: 'Learn More',
        prompt: 'New features are available for Sublime Text Keymap 3.0. Do you want to enable the new features?',
        noChange: 'Sublime Text Keymap: New features have not been enable.',
        change: 'Sublime Text Keymap: New features have been added.',
    };
    constructor(private updateSetting: VersionThreeUpdateSetting, private editorConfig: WorkspaceConfiguration) { }

    public showMessage(): void {
        const answer = showInformationMessage(this.messages.prompt, this.messages.yes, this.messages.no, this.messages.learnMore);

        answer.then((selectedOption) => {

            if (selectedOption === this.messages.yes) {
                this.updateSetting.persist();
                updateSettings(this.editorConfig, versionThreeSettings);
                showInformationMessage(this.messages.change);
            } else if (selectedOption === this.messages.no) {
                this.updateSetting.persist();
                showInformationMessage(this.messages.noChange);
            } else if (selectedOption === this.messages.learnMore) {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=ms-vscode.sublime-keybindings'));
            }
        });
    }
}
