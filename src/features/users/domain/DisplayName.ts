export class DisplayName {
  private readonly value: string;

  constructor(value: string) {
    if (value.length < 2 || value.length > 20) {
      throw new Error("Display name must be 2-20 characters");
    }
    this.value = value;
  }

  toString() {
    return this.value;
  }

  equals(other: DisplayName): boolean {
    return this.value === other.value;
  }
}
