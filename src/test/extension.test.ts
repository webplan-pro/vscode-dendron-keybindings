import * as assert from 'assert';
import * as vscode from 'vscode';
import { ExtensionsImporter} from '../extensionImporter';
import * as snippetConverter from '../snippetConverter';

// import * as myExtension from '../extension';
// import { Importer } from '../importer';

suite("Extension Tests", async () => {
    test("Something 1", async () => {
        const test = snippetConverter.processSnippetFolder('C:\\Users\\t-tisali\\AppData\\Roaming\\Sublime Text 3\\Packages\\User');
            console.log(test);
        process.env.VSCODE_CWD
        const result = await new ExtensionsImporter().getExtensionsMappingAsync(vscode.Uri.file('C:/Users/t-tisali/AppData/Roaming/Sublime Text 3/'));
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