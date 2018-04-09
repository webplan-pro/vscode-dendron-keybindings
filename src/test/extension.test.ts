import * as assert from 'assert';
import { Mapper, AnalyzedSettings } from '../mapper';
import { MappedSetting, ISetting } from '../settings';
import * as testData from './testData';

suite('Importer Tests', async () => {

    const expected = new Map<string, MappedSetting>([
        ['numberSetting', new MappedSetting({ name: 'tab_size$test', value: 12 }, { name: 'editor.tabSize$test', value: 12 })],
        ['stringSetting', new MappedSetting({ name: 'word_separators$test', value: "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?" }, { name: 'editor.wordSeparators$test', value: "./\\()\"'-:,.;<>~!@#$%^&*|+=[]{}`~?" })],
        ['boolSetting', new MappedSetting({ name: 'ensure_newline_at_eof_on_save$test', value: false }, { name: 'files.insertFinalNewline$test', value: false })],
        ['complexSetting', new MappedSetting({ name: 'draw_white_space$test', value: 'boundary' }, { name: 'editor.renderWhitespace$test', value: 'boundary' })],
    ]);

    test('Import different types', async () => {
        const importer: Mapper = new Mapper(JSON.stringify(testData.testMappings));
        const settings: AnalyzedSettings = await importer.getMappedSettings(JSON.stringify(testData.sublimeSettings));
        assert.ok(settings.mappedSettings.length === 4, `mappedSettings.length is ${settings.mappedSettings.length} instead of 4`);
        expected.forEach((expSetting) => {
            const setting = settings.mappedSettings.find(m => m.sublime.name === expSetting.sublime.name);
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
