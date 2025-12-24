import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 現在のログインユーザーを取得
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // ログインしていなければログイン画面へ強制送還
  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <div className="mt-4 p-4 border rounded shadow">
        <p>
          <strong>メールアドレス:</strong> {user.email}
        </p>
        <p>
          <strong>ログイン方法:</strong> {user.app_metadata.provider}
        </p>
        <p>
          <strong>ユーザーID:</strong> {user.id}
        </p>
      </div>
      <form action="/api/auth/signout" method="post">
        <button className="mt-4 text-red-500 underline">ログアウト</button>
      </form>
    </div>
  );
}
