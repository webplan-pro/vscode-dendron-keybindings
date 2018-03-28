import * as vscode from 'vscode';
import { MappedSetting } from '../settings';
import { promisifier } from '../fsWrapper';
import * as fs from 'fs';

export class HTMLCreator {
    constructor(private projectRoot: vscode.Uri) { }

    public async getHTMLAsync(mapped: MappedSetting[], sublimeSettingsPath: vscode.Uri, isValid: boolean): Promise<string> {
        const htmlContent = await this.loadHTMLFileFromDisk('main.html');
        const replacedHTMLContent: string = htmlContent.replace(/\$\$ABS_PATH_TO_ROOT\$\$/g, this.projectRoot.fsPath)
            .replace('$$BACKEND-DATA$$', JSON.stringify({
                'mappedSettings': mapped,
                'sublimeSettingsPath': encodeURI(sublimeSettingsPath.fsPath),
                'isValid': isValid
            }));
        return replacedHTMLContent;
    }

    private async loadHTMLFileFromDisk(filename: string): Promise<string> {
        let htmlPath = vscode.Uri.file(`${this.projectRoot.fsPath}/resources/${filename}`);
        return await promisifier<string>(fs.readFile, htmlPath.fsPath, 'utf8');
    }
}