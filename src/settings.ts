export interface ISetting {
  readonly name: string;
  readonly value: any;
}

export interface IVscodeSetting extends ISetting {
  overwritesValue?: boolean;
  newValue?: any;
  oldValue?: any;
}

const emptySetting = { name: '', value: '' };

export class MappedSetting {
  public sublime: ISetting;
  public vscode: IVscodeSetting;

  constructor(settings: {sublimeSetting?: ISetting; vscodeSetting?: IVscodeSetting}) {
    this.sublime = settings.sublimeSetting || emptySetting;
    this.vscode = settings.vscodeSetting || emptySetting;
  }

  public markAsOverride(oldValue: any): void {
    this.vscode.overwritesValue = true;
    this.vscode.oldValue = oldValue;
  }
}

export class CategorizedSettings {
  public mappedSettings: MappedSetting[] = [];
  public alreadyExisting: MappedSetting[] = [];
  public noMappings: ISetting[] = [];
  public sublimeFeelSettings: MappedSetting[] = [];   // settings that are not in the mappings file but improve the sublime feel & look in VS Code
}
