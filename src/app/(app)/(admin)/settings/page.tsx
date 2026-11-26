import PasswordResetPanel from "@/components/PasswordResetPanel";
import RolesPanel from "@/components/RolesPanel";
import Stack from "@/components/Stack";

export const metadata = { title: "Settings · Karthi Portfolio" };

export default function SettingsPage() {
  return (
    <Stack>
      <RolesPanel />
      <PasswordResetPanel />
    </Stack>
  );
}
