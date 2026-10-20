import { requireUser } from "@/server/auth";
import { SettingsPanel } from "@/components/settings-panel";
import type { Language } from "@/lib/types";

export default async function InterceptedSettings() {
  const user = await requireUser();
  return <SettingsPanel user={{ name: user.name, email: user.email, language: (user.preference?.language ?? "python") as Language, level: user.preference?.level ?? "INITIATION" }} />;
}
