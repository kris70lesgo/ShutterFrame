import { SettingsRow } from '../ui/SettingsRow';

export function RehearsalPolicyContent() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-6">
        <section>
          <h3 className="text-[16px] font-semibold text-[#F2F2F2] mb-4">Required checks</h3>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Schema integrity" isToggle toggleValue={true} />
             <SettingsRow label="Foreign keys" isToggle toggleValue={true} />
             <SettingsRow label="Row preservation" isToggle toggleValue={true} />
             <SettingsRow label="Smoke queries" isToggle toggleValue={true} />
             <SettingsRow label="Rollback verification" isToggle toggleValue={true} hideDivider />
          </div>
        </section>

        <section>
          <h3 className="text-[16px] font-semibold text-[#F2F2F2] mb-4">General behavior</h3>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Maximum migration duration">
                <select defaultValue="10 minutes" className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>5 minutes</option>
                  <option>10 minutes</option>
                  <option>30 minutes</option>
                </select>
             </SettingsRow>
             <SettingsRow label="Block on failed required check" description="Prevent approval when any required rehearsal check fails." isToggle toggleValue={true} />
             <SettingsRow label="Require approval before promotion" isToggle toggleValue={true} />
             <SettingsRow label="Warning behavior" hideDivider>
                <select className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>Allow warnings</option>
                  <option>Require review</option>
                  <option>Treat warnings as failures</option>
                </select>
             </SettingsRow>
          </div>
        </section>
      </div>
    </div>
  );
}
