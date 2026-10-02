import { getLawyerSession } from "../../../lawyer-auth";
export async function GET() {
  const session = await getLawyerSession();
  return Response.json({ authenticated: Boolean(session), accountExists: true, registrationAvailable: true, invitationOnly: true });
}
