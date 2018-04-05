import {resolve} from 'path';
import * as vscode from 'vscode';
import { readFileAsync } from './fsWrapper';
import { Importer } from './importer';
import { MultiQuickpick } from './multiQuickpick';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const mappingsFile: string = await readFileAsync(resolve(__dirname, '..', 'mappings/settings.json'), 'utf-8');
    new MultiQuickpick(context, new Importer(mappingsFile));
}
