import { UserId } from "./UserId";
import { DisplayName } from "./DisplayName";

export class User {
  constructor(
    readonly id: UserId,
    private displayName: DisplayName
  ) {}

  changeDisplayName(newName: DisplayName) {
    if (this.displayName.equals(newName)) {
      return;
    }
    this.displayName = newName;
  }

  getDisplayName(): DisplayName {
    return this.displayName;
  }
}
