import * as assert from 'assert';
import { resolve } from 'path';
import { readFileAsync } from '../fsWrapper';
import { Importer } from '../importer';
import { MappedSetting, Setting } from '../settings';
import * as testData from './testData';

suite('Importer Tests', async () => {

    test('Import different types', async () => {
        const expected = new Map<string, MappedSetting>([
            ['numberSetting', new MappedSetting(new Setting('tab_size', 12), new Setting('editor.tabSize', 12))],
            ['stringSetting', new MappedSetting(new Setting('word_separators', '-/_'), new Setting('editor.wordSeparators', '-/_'))],
            ['boolSetting', new MappedSetting(new Setting('ensure_newline_at_eof_on_save', false), new Setting('files.insertFinalNewline', false))],
            ['complexSetting', new MappedSetting(new Setting('draw_white_space', 'boundary'), new Setting('editor.renderWhitespace', 'boundary'))],
        ]);

        const importer: Importer = new Importer(await readFileAsync(resolve(__dirname, '..', '..', 'mappings/settings.json'), 'utf-8'));
        const mappedSettings: MappedSetting[] = await importer.getMappedSettingsAsync(JSON.stringify(testData.sublimeSettings));
        assert.ok(mappedSettings.length === 4);
        expected.forEach((expSetting) => {
            const setting = mappedSettings.find(m => m.sublime.name === expSetting.sublime.name);
            if (!setting) {
                assert.fail(setting, 'A setting');
            } else {
                assert.ok(setting.vscode.name === expSetting.vscode.name
                    && setting.vscode.value === expSetting.vscode.value);
            }
        });
    });
});
