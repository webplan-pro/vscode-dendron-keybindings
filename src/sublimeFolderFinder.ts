import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fileSystem from './fsWrapper';

interface ISublimeFolders {
    main: vscode.Uri;
    settings: vscode.Uri;
}

export const sublimeSettingsFilename = 'Preferences.sublime-settings';

const defaultSublimeSettingsPaths: Map<string, string[]> = new Map([
    ['win32', [path.join(os.homedir(), 'AppData', 'Roaming', 'Sublime Text 3')]],
    ['darwin', [path.join(os.homedir(), 'Library', 'Application Support', 'Sublime Text 3')]],
    ['linux', [path.join(os.homedir(), '.config', 'sublime-text-3')]],
]);

const settingsSubfoldersPath = path.join('Packages', 'User', 'Preferences.sublime-settings');

export async function getExistingDefaultPaths(): Promise<ISublimeFolders[]> {
    const foundPaths = await getOSDefaultPaths();
    if (!foundPaths.length) {
        return [];
    }
    const existingDefaultPaths: ISublimeFolders[] = await filterForExistingDirsAsync(foundPaths);
    return existingDefaultPaths;
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

async function filterForExistingDirsAsync(paths: string[]): Promise<ISublimeFolders[]> {
    const existingDirs: ISublimeFolders[] = [];
    for (const p of paths) {
        const settingsPath: string = path.resolve(p, settingsSubfoldersPath);
        if (await fileSystem.pathExists(settingsPath)) {
            existingDirs.push({ main: vscode.Uri.file(p), settings: vscode.Uri.file(settingsPath) });
        }
    }

    return existingDirs;
}

export interface ISublimeSettingsPickerResult {
    path: vscode.Uri;
    sublimeSettingsPath?: vscode.Uri;
}

export async function pickSublimeSettings(): Promise<ISublimeSettingsPickerResult | undefined> {
    const folderPaths = await vscode.window.showOpenDialog({ canSelectFolders: true });
    if (!folderPaths) {
        return undefined;
    }

    const sublimeSettingsFolders: ISublimeFolders[] = await filterForExistingDirsAsync([folderPaths[0].fsPath]);
    if (!sublimeSettingsFolders.length) {
        return {
            path: folderPaths[0],
        };
    }

    return {
        path: folderPaths[0],
        sublimeSettingsPath: sublimeSettingsFolders[0].settings,
    };
}
