import { destroyLawyerSession } from "../../../lawyer-auth";
export async function POST() { await destroyLawyerSession(); return Response.json({ ok: true }); }
