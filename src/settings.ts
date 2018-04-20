export interface ISetting {
  readonly name: string;
  readonly value: any;
}

export class MappedSetting {
  public sublime: ISetting;
  public vscode: ISetting;
  public willOverride: boolean = false;
  public duplicateVscodeSetting?: ISetting;

  constructor(sublimeSetting: ISetting, vscodeSetting?: ISetting) {
    this.sublime = sublimeSetting || { name: '', value: '' };
    this.vscode = vscodeSetting || { name: '', value: '' };
  }

  public setVscode(setting: ISetting): void {
    this.vscode = setting;
  }

  public markAsOverride(vscodeName: string, newValue: any): void {
    this.willOverride = true;
    this.duplicateVscodeSetting = {name: vscodeName, value: newValue};
  }
}

export class CategorizedSettings {
  public mappedSettings: MappedSetting[] = [];
  public alreadyExisting: MappedSetting[] = [];
  public noMappings: ISetting[] = [];
  public sublimeFeelSettings: MappedSetting[] = [];   // settings that are not in the mappings file but improve the sublime feel & look in VS Code
}
