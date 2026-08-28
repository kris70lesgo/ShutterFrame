import { SettingsRow } from '../ui/SettingsRow';

export function CleanupContent() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-6">
        <section>
          <h3 className="text-[16px] font-semibold text-[#F2F2F2] mb-4">Neon preview branches</h3>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Auto-delete preview branch after rehearsal" description="Delete temporary Neon branches after the rehearsal completes." isToggle toggleValue={true} />
             <SettingsRow label="Preview branch cleanup timeout" hideDivider>
                <select defaultValue="30 minutes" className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>10 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                </select>
             </SettingsRow>
          </div>
        </section>

        <section>
          <h3 className="text-[16px] font-semibold text-[#F2F2F2] mb-4">Daytona sandboxes</h3>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Auto-delete rehearsal sandbox" description="Remove temporary Daytona sandboxes after a completed or failed run." isToggle toggleValue={true} />
             <SettingsRow label="Sandbox timeout" hideDivider>
                <select defaultValue="20 minutes" className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>10 minutes</option>
                  <option>20 minutes</option>
                  <option>60 minutes</option>
                </select>
             </SettingsRow>
          </div>
        </section>

        <section>
          <h3 className="text-[16px] font-semibold text-[#F2F2F2] mb-4">Global</h3>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Failed rehearsal cleanup" description="Attempt cleanup even when a rehearsal fails unexpectedly." isToggle toggleValue={true} hideDivider />
          </div>
        </section>
      </div>
    </div>
  );
}
