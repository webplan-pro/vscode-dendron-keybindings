import {resolve} from 'path';
import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { HTMLPreviewEditor } from './htmlPreview';
import { Importer } from './importer';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const mappingsFile: string = await readFileAsync(resolve(__dirname, '..', 'mappings/settings.json'), 'utf-8');
    new HTMLPreviewEditor(context, new Importer(mappingsFile));
}
