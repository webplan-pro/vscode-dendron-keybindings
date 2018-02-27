import { MappedSetting } from "../importer";

class MappedUnmappedSettings {
    mapped: MappedSetting[] = [];
    unmapped: MappedSetting[] = [];
}

export class HTMLCreator {

    replaceInitialHTML(htmlContent: string, context) {
        return htmlContent.replace('$$IMPORT_CSS_SCRIPTS$$', `<link rel="stylesheet" type="text/css" href="file://${context.asAbsolutePath('resources/style.css')}">`)
            .replace('$$IMPORT_JS_SCRIPTS$$', `<script src="file://${context.asAbsolutePath('out/gui/gui.js')}"></script>`);
    }
    createTable(newData: MappedSetting[]): string {
        let tableString = this.createTRs(newData);
        tableString += "</table>";
        return tableString;
    }

    createTRs(settings: MappedSetting[]) {
        const { mapped, unmapped } = this.sortMappedSettings(settings);
        let trs: string = mapped.map(this.createTR, this).join('');
        trs += unmapped.map(this.createTR, this).join('');
        return trs;
    }

    createTR(setting: MappedSetting) {
        let tr = `<tr data-sublimename='${setting.sublime.name}' data-sublimevalue='${setting.sublime.value}' data-vscodename='${setting.vscode.name}' data-vscodevalue='${setting.vscode.value}'>`;
        if (MappedSetting.hasNoMatch(setting)) {
            tr += this.createTD('');
        } else {
            tr += this.createTD('<input class="setting_checkbox" type="checkbox"/>');
        }
        tr += this.createTD(setting.sublime.name);
        tr += this.createTD(setting.sublime.value);
        tr += this.createTD(setting.vscode.name);
        tr += this.createTD(setting.vscode.value);
        tr += "</tr>";
        return tr;
    }


    sortMappedSettings(settings: MappedSetting[]): MappedUnmappedSettings {
        const sep: MappedUnmappedSettings = settings.reduce((prev, curr) => {
            if (MappedSetting.hasNoMatch(curr)) {
                prev.unmapped.push(curr);
            } else {
                prev.mapped.push(curr);
            }
            return prev;
        }, new MappedUnmappedSettings());

        sep.mapped.sort((a, b) => {
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        sep.unmapped.sort((a, b) => {
            return a.sublime.name.localeCompare(b.sublime.name);
        });
        return sep;
    }

    createTD(val) {
        return `<td><span>${val}</span></td>`;
    }
}