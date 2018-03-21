export class Setting {
  constructor(public name: string, public value: string | boolean) {
    if (this.value === 'true' || this.value === 'false') {
      this.value = new Boolean(this.value).valueOf();
    }
  }

  public getNamespaceAndSettingName(): {namespace: string, settingName: string} {
    const lastIdx = this.name.lastIndexOf(".");
    const [namespace, settingName] = [this.name.substring(0, lastIdx), this.name.substring(lastIdx + 1)];
    return {namespace, settingName};
  }
}