import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fileSystem from './fsWrapper';

export const sublimeSettingsFilename = 'Preferences.sublime-settings';

const defaultSublimeSettingsPaths: Map<string, string[]> = new Map([
    ['win32', [path.join(os.homedir(), 'AppData', 'Roaming', 'Sublime Text 3')]],
    ['darwin', [path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text 3')]],
    ['linux', [path.join(os.homedir(), '.config', 'sublime-text-3')]],
]);

const settingsSubfoldersPath = path.join('Packages', 'User', 'Preferences.sublime-settings');

export async function getExistingDefaultPaths(): Promise<vscode.Uri | undefined> {
    const foundPaths = await getOSDefaultPaths();
    if (!foundPaths.length) {
        return undefined;
    }
    return filterForExistingDirsAsync(foundPaths);
}

export function getOSDefaultPaths(): string[] {
    const platform: NodeJS.Platform = os.platform();
    const foundPaths: string[] | undefined = defaultSublimeSettingsPaths.get(platform);
    if (!foundPaths) {
        console.log('OS could not be identified. No default paths provided.');
        return [];
    }
    return foundPaths;
}

async function filterForExistingDirsAsync(paths: string[]): Promise<vscode.Uri | undefined> {
    for (const p of paths) {
        const settingsPath: string = path.resolve(p, settingsSubfoldersPath);
        if (await fileSystem.pathExists(settingsPath)) {
            return vscode.Uri.file(settingsPath);
        }
    }

    return undefined;
}

export interface ISublimeSettingsPickerResult {
    path: vscode.Uri;
    sublimeSettingsPath?: vscode.Uri;
}

export async function pickSublimeSettings(): Promise<vscode.Uri | undefined> {
    const folderPaths = await vscode.window.showOpenDialog({ canSelectFolders: true });
    if (!folderPaths) {
        return undefined;
    }

    return await filterForExistingDirsAsync([folderPaths[0].fsPath]);
}
