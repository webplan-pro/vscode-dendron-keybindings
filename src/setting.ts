export class Setting {
  constructor(public name: string, public value: string) {
    if (typeof this.value === 'boolean') {
      this.value = String(this.value);
    }
  }

  public getNamespaceAndSettingName(): {namespace: string, settingName: string} {
    const lastIdx = this.name.lastIndexOf(".");
    const [namespace, settingName] = [this.name.substring(0, lastIdx), this.name.substring(lastIdx + 1)];
    return {namespace, settingName};
  }
}