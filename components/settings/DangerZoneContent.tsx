import { SettingsRow } from '../ui/SettingsRow';
import { Button } from '../ui/Button';

export function DangerZoneContent() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
         <SettingsRow
           label="Clear rehearsal history"
           description="Remove stored rehearsal runs and associated evidence from this workspace."
         >
            <Button variant="destructive">Clear history</Button>
         </SettingsRow>

         <SettingsRow
           label="Disconnect all integrations"
           description="Disconnect GitHub, TrueForge, Neon, and Daytona from this workspace."
         >
            <Button variant="destructive">Disconnect integrations</Button>
         </SettingsRow>

         <SettingsRow
           label="Delete workspace"
           description="Permanently delete this ShutterFrame workspace and its configuration."
           hideDivider
         >
            <Button variant="destructive">Delete workspace</Button>
         </SettingsRow>
      </div>
    </div>
  );
}
