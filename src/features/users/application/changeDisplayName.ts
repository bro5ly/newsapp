import { UserId } from "../domain/UserId";
import { DisplayName } from "../domain/DisplayName";
import { UserRepository } from "../repository/userRepository";

export async function changeDisplayName(
  repo: UserRepository,
  userId: string,
  newName: string
) {
  const id = new UserId(userId);
  const displayName = new DisplayName(newName);

  const user = await repo.findById(id);
  if (!user) throw new Error("User not found");

  user.changeDisplayName(displayName);
  await repo.save(user);
}
