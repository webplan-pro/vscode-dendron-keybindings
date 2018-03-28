export class Setting {
  constructor(readonly name: string, readonly value: any) {}
}

export class MappedSetting {
  public static hasNoMatch(setting: MappedSetting): boolean {
    if (setting && setting.vscode) {
      return setting.vscode.name === MappedSetting.NO_MATCH;
    }
    return true;
  }

  private static readonly NO_MATCH: string = "--No Match--";
  public sublime: Setting;
  public vscode: Setting;
  public isDuplicate: boolean = false;
  public duplicateVscodeSetting: Setting;

  constructor(sublimeSetting: Setting, vscodeSetting?: Setting) {
    this.sublime = sublimeSetting;
    this.vscode = vscodeSetting || new Setting(MappedSetting.NO_MATCH, MappedSetting.NO_MATCH);
  }

  public setVscode(setting: Setting): void {
    this.vscode = setting;
  }

  public markAsDuplicate(vscodeSetting: Setting) {
    this.isDuplicate = true;
    this.duplicateVscodeSetting = vscodeSetting;
  }
}