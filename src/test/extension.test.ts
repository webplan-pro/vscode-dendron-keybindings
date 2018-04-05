import * as assert from 'assert';
import { Importer } from '../importer';
import { MappedSetting, Setting } from '../settings';
import * as testData from './testData';

suite('Importer Tests', async () => {

    const expected = new Map<string, MappedSetting>([
        ['numberSetting', new MappedSetting(new Setting('tab_size$test', 12), new Setting('editor.tabSize$test', 12))],
        ['stringSetting', new MappedSetting(new Setting('word_separators$test', '-/_'), new Setting('editor.wordSeparators$test', '-/_'))],
        ['boolSetting', new MappedSetting(new Setting('ensure_newline_at_eof_on_save$test', false), new Setting('files.insertFinalNewline$test', false))],
        ['complexSetting', new MappedSetting(new Setting('draw_white_space$test', 'boundary'), new Setting('editor.renderWhitespace$test', 'boundary'))],
    ]);

    test('Import different types', async () => {
        const importer: Importer = new Importer(JSON.stringify(testData.testMappings));
        const mappedSettings: MappedSetting[] = await importer.getMappedSettingsAsync(JSON.stringify(testData.sublimeSettings));
        assert.ok(mappedSettings.length === 4, `mappedSettings.length is ${mappedSettings.length} instead of 4`);
        expected.forEach((expSetting) => {
            const setting = mappedSettings.find(m => m.sublime.name === expSetting.sublime.name);
            if (!setting) {
                assert.fail(JSON.stringify(expSetting), 'Could not find mapped setting');
            } else {
                assert.ok(setting.vscode.name === expSetting.vscode.name
                    && setting.vscode.value === expSetting.vscode.value,
                    `Setting ${setting.vscode.name}: ${setting.vscode.value} failed`);
            }
        });
    });
});
