import * as assert from 'assert';
import * as temp from 'temp';
import * as vscode from 'vscode';
// import { promisifier } from '../fsWrapper';

suite('Extension Tests', async () => {
    test('Something 1', async () => {
        temp.track(); // Automatically track and cleanup files at exit
        // const tempFile: temp.OpenFile = await promisifier<temp.OpenFile>(temp.open);
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('editor');
        let result: boolean = config.has('matchBrackets2');
        assert.ok(result);
        return result;
    });

});
//     /**
//      * 1. Read all mappings from file
//      * 2. Move all existing settings to safe place
//      * 3. Add each mapping with each possible value to settings
//      * 4. Check if valid
//      * 5. Restore orig settings
//      */
//     test("Something 1", () => {
//         const importer = new Importer();
//         // importer.getMappedSettings();
//     });
// });
