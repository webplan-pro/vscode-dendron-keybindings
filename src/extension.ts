import * as vscode from 'vscode';
import { HTMLPreviewEditor } from './htmlPreview';

export function activate(context: vscode.ExtensionContext) {
    new HTMLPreviewEditor(context);
}