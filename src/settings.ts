export interface ISetting {
  readonly name: string;
  readonly value: any;
}

export class MappedSetting {
  public static hasNoMatch(setting: MappedSetting): boolean {
    if (setting && setting.vscode) {
      return setting.vscode.name === MappedSetting.NO_MATCH;
    }
    return true;
  }

  private static readonly NO_MATCH: string = '--No Match--';
  public sublime: ISetting;
  public vscode: ISetting;
  public isDuplicate: boolean = false;
  public duplicateVscodeSetting?: ISetting;

  constructor(sublimeSetting: ISetting, vscodeSetting?: ISetting) {
    this.sublime = sublimeSetting;
    this.vscode = vscodeSetting || {name: MappedSetting.NO_MATCH, value: MappedSetting.NO_MATCH};
  }

  public setVscode(setting: ISetting): void {
    this.vscode = setting;
  }

  public markAsDuplicate(vscodeSetting: ISetting): void {
    this.isDuplicate = true;
    this.duplicateVscodeSetting = vscodeSetting;
  }
}
