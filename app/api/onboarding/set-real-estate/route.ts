import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES } from "@/infrastructure/config/constants";
import { getLangServerSide } from "@/infrastructure/shared/utils/lang";
import { createRouter } from "@/i18n/router";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const cookieStore = await cookies()
  const lang = await getLangServerSide();
  const routes = createRouter(lang);

  if (!id) {
    return new Response("Unauthorized", { status: 401 });
  }

  cookieStore.set(COOKIE_NAMES.REAL_ESTATE, id);

  return redirect(routes.dashboard());
}
