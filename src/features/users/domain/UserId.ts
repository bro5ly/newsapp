export class UserId {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new Error("UserId is required");
    }
    this.value = value;
  }

  toString() {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
