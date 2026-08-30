import { SettingsRow } from '../ui/SettingsRow';
import { Button } from '../ui/Button';

export function IntegrationsContent() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-6">
        {/* GitHub */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[16px] font-semibold text-[#F2F2F2]">GitHub</h3>
            <span className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6]">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              Connected
            </span>
          </div>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <div className="px-[18px] py-[16px] border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <p className="text-[14px] text-[#A6A6A6]">Connected organization: <span className="text-[#F2F2F2]">acme</span></p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary">Test connection</Button>
                  <Button variant="secondary">Reconnect</Button>
                  <Button variant="destructive">Disconnect</Button>
                </div>
             </div>
             <SettingsRow label="Default repository" description="The primary repository for this workspace." >
                <span className="text-[14px] text-[#F2F2F2]">acme/backend</span>
             </SettingsRow>
             <SettingsRow label="Default branch" >
                <span className="text-[14px] text-[#F2F2F2]">main</span>
             </SettingsRow>
             <SettingsRow label="PR auto-detection" isToggle toggleValue={true} />
             <SettingsRow label="Migration path pattern" hideDivider>
                <input type="text" defaultValue="migrations/**" className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]" />
             </SettingsRow>
          </div>
        </section>

        {/* TrueForge */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[16px] font-semibold text-[#F2F2F2]">TrueForge</h3>
            <span className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6]">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              Credentials configured
            </span>
          </div>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <div className="px-[18px] py-[16px] border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <p className="text-[14px] text-[#A6A6A6]">Active provider: <span className="text-[#F2F2F2]">DeepSeek</span></p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary">Test connection</Button>
                  <Button variant="secondary">Reconnect</Button>
                </div>
             </div>
             <SettingsRow label="Model">
                <select className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>deepseek-v4-flash</option>
                  <option>deepseek-v4-pro</option>
                </select>
             </SettingsRow>
             <SettingsRow label="Base URL">
                 <span className="text-[14px] text-[#F2F2F2]">https://api.deepseek.com</span>
             </SettingsRow>
             <SettingsRow label="Session timeout" hideDivider>
                 <select className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>120 seconds</option>
                </select>
             </SettingsRow>
          </div>
        </section>

        {/* Neon */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[16px] font-semibold text-[#F2F2F2]">Neon</h3>
            <span className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6]">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              Connected
            </span>
          </div>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <SettingsRow label="Project ID">
                 <span className="text-[14px] text-[#F2F2F2] font-mono">old-water-123456</span>
             </SettingsRow>
             <SettingsRow label="Default parent branch">
                 <span className="text-[14px] text-[#F2F2F2]">main</span>
             </SettingsRow>
             <SettingsRow label="Preview branch naming pattern">
                <input type="text" defaultValue="shutterframe/{pr-number}-{run-id}" className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-full max-w-[280px]" />
             </SettingsRow>
             <SettingsRow label="Auto-delete preview branch after run" isToggle toggleValue={true} />
             <SettingsRow label="Cleanup timeout" hideDivider>
                <select className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>10 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                </select>
             </SettingsRow>
          </div>
        </section>

        {/* Daytona */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[16px] font-semibold text-[#F2F2F2]">Daytona</h3>
            <span className="flex items-center gap-1.5 text-[13px] text-[#A6A6A6]">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              Connected
            </span>
          </div>
          <div className="border border-white/5 rounded-[12px] bg-black/12 overflow-hidden">
             <div className="px-[18px] py-[16px] border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary">Test sandbox</Button>
                  <Button variant="secondary">Reconnect</Button>
                </div>
             </div>
             <SettingsRow label="Default sandbox region">
                 <span className="text-[14px] text-[#F2F2F2]">us-east</span>
             </SettingsRow>
             <SettingsRow label="Default sandbox image">
                 <span className="text-[14px] text-[#F2F2F2]">daytonaio/workspace-project</span>
             </SettingsRow>
             <SettingsRow label="Sandbox timeout">
                <select className="h-[36px] bg-[#2A2A2A] border border-[#444] rounded-lg px-3 text-[14px] text-[#ECECEC] focus:border-[#555] focus:outline-none w-[200px]">
                  <option>10 minutes</option>
                  <option>20 minutes</option>
                  <option>60 minutes</option>
                </select>
             </SettingsRow>
             <SettingsRow label="Auto-cleanup" isToggle toggleValue={true} hideDivider />
          </div>
        </section>
      </div>
    </div>
  );
}
