import { UserRepository } from "@/users/repository/userRepository";
import { User } from "@/users/domain/User";
import { UserId } from "@/users/domain/UserId";
import { DisplayName } from "@/users/domain/DisplayName";
import { createServerClient } from "./serverClient";

export const supabaseUserRepository: UserRepository = {
  async findById(id: UserId) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id.toString())
      .single();

    if (!data) return null;

    return new User(
      new UserId(data.id),
      new DisplayName(data.display_name)
    );
  },

  async save(user: User) {
    const supabase = createServerClient();
    await supabase
      .from("profiles")
      .update({
        display_name: user.getDisplayName().toString(),
      })
      .eq("id", user.id.toString());
  },
};
