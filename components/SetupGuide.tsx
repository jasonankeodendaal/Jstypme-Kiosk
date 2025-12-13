
import React, { useState } from 'react';
import { X, Server, Copy, Check, ArrowRight, ExternalLink, ShieldCheck, Database, Key, Settings, Layers, Smartphone, Globe, Cpu, Cloud, ToggleRight, CloudLightning, Book, AlertTriangle, PlayCircle, FolderOpen, Lock, MousePointer, Terminal, Package, HardDrive, Box, Code, Hammer } from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'build' | 'vercel' | 'supabase'>('supabase');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const CodeBlock = ({ code, id, label }: { code: string, id: string, label?: string }) => (
    <div className="my-4 relative group">
      {label && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2"><Terminal size={12}/> {label}</div>}
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto relative shadow-lg border border-slate-700">
        <code className="font-mono text-sm text-blue-300 whitespace-pre block leading-relaxed">{code}</code>
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors border border-white/5"
          title="Copy to Clipboard"
        >
          {copiedStep === id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 shadow-xl shrink-0 flex items-center justify-between border-b border-slate-800">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
               <ShieldCheck size={24} className="text-white" />
             </div>
             <h1 className="text-2xl font-black tracking-tight">System Setup Manual</h1>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-12">Zero-to-Hero Guide v2.5</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <X size={28} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Sidebar (Desktop) */}
        <div className="w-72 bg-white border-r border-slate-200 p-4 flex-col shrink-0 overflow-y-auto hidden md:flex">
           <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 text-opacity-50 mt-4 px-2">Setup Phases</h3>
           
            <button 
             onClick={() => setActiveTab('supabase')}
             className={`p-3 rounded-xl border text-left mb-3 transition-all group relative overflow-hidden ${activeTab === 'supabase' ? 'border-green-600 bg-green-50 shadow-md' : 'border-transparent hover:bg-slate-50'}`}
           >
              <div className="flex items-center gap-3 relative z-10">
                 <Database size={18} className={activeTab === 'supabase' ? 'text-green-600' : 'text-slate-400'} />
                 <div>
                    <span className={`font-bold text-sm block ${activeTab === 'supabase' ? 'text-green-900' : 'text-slate-600'}`}>1. Supabase Cloud</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">The Backend</span>
                 </div>
              </div>
           </button>

           <button 
             onClick={() => setActiveTab('local')}
             className={`p-3 rounded-xl border text-left mb-3 transition-all group relative overflow-hidden ${activeTab === 'local' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-transparent hover:bg-slate-50'}`}
           >
              <div className="flex items-center gap-3 relative z-10">
                 <Server size={18} className={activeTab === 'local' ? 'text-blue-600' : 'text-slate-400'} />
                 <div>
                    <span className={`font-bold text-sm block ${activeTab === 'local' ? 'text-blue-900' : 'text-slate-600'}`}>2. Local Hub (PC)</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Offline Server</span>
                 </div>
              </div>
           </button>

           <button 
             onClick={() => setActiveTab('build')}
             className={`p-3 rounded-xl border text-left mb-3 transition-all group relative overflow-hidden ${activeTab === 'build' ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-transparent hover:bg-slate-50'}`}
           >
              <div className="flex items-center gap-3 relative z-10">
                 <Hammer size={18} className={activeTab === 'build' ? 'text-purple-600' : 'text-slate-400'} />
                 <div>
                    <span className={`font-bold text-sm block ${activeTab === 'build' ? 'text-purple-900' : 'text-slate-600'}`}>3. Code Build</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">The Frontend</span>
                 </div>
              </div>
           </button>

           <button 
             onClick={() => setActiveTab('vercel')}
             className={`p-3 rounded-xl border text-left mb-3 transition-all group relative overflow-hidden ${activeTab === 'vercel' ? 'border-black bg-slate-100 shadow-md' : 'border-transparent hover:bg-slate-50'}`}
           >
              <div className="flex items-center gap-3 relative z-10">
                 <Globe size={18} className={activeTab === 'vercel' ? 'text-black' : 'text-slate-400'} />
                 <div>
                    <span className={`font-bold text-sm block ${activeTab === 'vercel' ? 'text-slate-900' : 'text-slate-600'}`}>4. Vercel Deploy</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Go Live</span>
                 </div>
              </div>
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-12 scroll-smooth">
           <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-full pb-12">
              
              {/* Tab Header Mobile */}
              <div className="md:hidden flex border-b border-slate-200 overflow-x-auto bg-white shrink-0">
                 <button onClick={() => setActiveTab('supabase')} className={`flex-1 p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-4 transition-all ${activeTab === 'supabase' ? 'text-green-600 border-green-600 bg-green-50' : 'text-slate-500 border-transparent'}`}>1. Cloud</button>
                 <button onClick={() => setActiveTab('local')} className={`flex-1 p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-4 transition-all ${activeTab === 'local' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-slate-500 border-transparent'}`}>2. PC Hub</button>
                 <button onClick={() => setActiveTab('build')} className={`flex-1 p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-4 transition-all ${activeTab === 'build' ? 'text-purple-600 border-purple-600 bg-purple-50' : 'text-slate-500 border-transparent'}`}>3. Build</button>
                 <button onClick={() => setActiveTab('vercel')} className={`flex-1 p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-4 transition-all ${activeTab === 'vercel' ? 'text-black border-black bg-slate-100' : 'text-slate-500 border-transparent'}`}>4. Live</button>
              </div>

              {/* === TAB 1: SUPABASE === */}
              {activeTab === 'supabase' && (
                <div className="p-8 animate-fade-in">
                    <div className="mb-8 border-b border-slate-100 pb-8">
                       <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">Step 1: The Backend</div>
                       <h2 className="text-4xl font-black text-slate-900 mb-2">Supabase Cloud Setup</h2>
                       <p className="text-slate-600 text-lg">
                           The <strong>Backend</strong> of your Kiosk. It handles the Database (Products, Fleet) and Storage (Images, Videos).
                           Follow these steps to create your free database.
                       </p>
                    </div>

                    <div className="space-y-12">
                        
                        {/* Step 1 */}
                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">1</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Create Account & Project</h3>
                                <p className="text-slate-600 mb-4 text-sm">
                                    Supabase provides the PostgreSQL database and file storage for free.
                                </p>
                                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <li>Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline font-bold">supabase.com</a> and click <strong>"Start your project"</strong>.</li>
                                    <li>Sign in using GitHub (Recommended) or Email.</li>
                                    <li>Click the <strong>"New Project"</strong> button.</li>
                                    <li><strong>Name:</strong> Type <code className="bg-white px-1 border rounded">Kiosk Pro</code></li>
                                    <li><strong>Database Password:</strong> Click "Generate" and <strong>COPY IT</strong> to a safe place. You cannot see it again.</li>
                                    <li><strong>Region:</strong> Select the region closest to your physical store (e.g., US East, London, Singapore) for fastest speed.</li>
                                    <li>Click <strong>"Create new project"</strong>. Setup takes about 2 minutes.</li>
                                </ol>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">2</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Get API Credentials</h3>
                                <p className="text-slate-600 mb-4 text-sm">
                                    Your kiosk connects to the database using these keys. Treat them like passwords.
                                </p>
                                
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center gap-2">
                                        <MousePointer size={14} className="text-blue-600" />
                                        <span className="text-xs font-black uppercase text-slate-600">Follow these exact clicks:</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-slate-100 p-2 rounded text-slate-600"><Settings size={18} /></div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800">1. Project Settings</div>
                                                <div className="text-xs text-slate-500">Look for the <strong>Gear Icon</strong> at the bottom of the left sidebar.</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-slate-100 p-2 rounded text-slate-600"><Key size={18} /></div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-800">2. API Configuration</div>
                                                <div className="text-xs text-slate-500">Click <strong>"API"</strong> in the list of settings sections.</div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                                            <strong>Save These Two Values:</strong>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li><code>Project URL</code> (starts with https://...)</li>
                                                <li><code>anon public</code> key (long string starting with eyJ...)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-6">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">3</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Run Database Script</h3>
                                <p className="text-slate-600 mb-4 text-sm">
                                    We need to create the tables for Products and Devices.
                                    <br/>
                                    Go to the <strong>SQL Editor</strong> (Paper icon on left bar), click <strong>"New Query"</strong>, paste the code below, and click <strong>Run</strong>.
                                </p>
                                
                                <div className="p-4 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-lg mb-4 text-xs font-medium">
                                    <span className="font-bold uppercase">Important:</span> This script enables "Row Level Security" but creates open policies for the kiosk to function without user login.
                                </div>

                                <CodeBlock 
                                    id="sql-script"
                                    label="SQL Query"
                                    code={`-- 1. Create Storage Bucket for Media
insert into storage.buckets (id, name, public)
values ('kiosk-media', 'kiosk-media', true)
on conflict (id) do nothing;

-- 2. Allow Public Access to Storage (Images/Videos)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'kiosk-media' );

create policy "Public Insert"
  on storage.objects for insert
  with check ( bucket_id = 'kiosk-media' );

-- 3. Create Main Config Table (Stores JSON data)
create table if not exists public.store_config (
  id serial primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Insert Default Config if empty (Includes Default PIN)
insert into public.store_config (id, data)
values (1, '{
  "hero": {
    "title": "Welcome",
    "subtitle": "Digital Experience"
  },
  "brands": [],
  "fleet": [],
  "systemSettings": {
      "setupPin": "0000" 
  }
}'::jsonb)
on conflict (id) do nothing;

-- 5. Create Fleet Telemetry Table (Updated Schema)
create table if not exists public.kiosks (
  id text primary key,
  name text,
  device_type text, 
  status text,
  last_seen timestamp with time zone,
  wifi_strength int,
  ip_address text,
  version text,
  location_description text,
  assigned_zone text,
  restart_requested boolean default false,
  notes text
);

-- 6. Enable Row Level Security (RLS)
alter table public.store_config enable row level security;
alter table public.kiosks enable row level security;

-- 7. Create OPEN Policies (Allows Kiosk to Read/Write without Login)
-- Config Policies
create policy "Enable read access for all users"
on public.store_config for select
using (true);

create policy "Enable update access for all users"
on public.store_config for update
using (true)
with check (true);

create policy "Enable insert access for all users"
on public.store_config for insert
with check (true);

-- Fleet Policies
create policy "Enable read access for fleet"
on public.kiosks for select
using (true);

create policy "Enable insert/update for fleet"
on public.kiosks for all
using (true)
with check (true);`}
                                />
                            </div>
                        </div>

                    </div>
                </div>
              )}

              {/* === TAB 2: LOCAL HUB === */}
              {activeTab === 'local' && (
                  <div className="p-8 animate-fade-in">
                      <div className="mb-8 border-b border-slate-100 pb-8">
                         <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4">Step 2: Local Server</div>
                         <h2 className="text-4xl font-black text-slate-900 mb-2">PC Hub Setup</h2>
                         <p className="text-slate-600 text-lg">
                             Running the kiosk locally on a PC is useful for <strong>testing</strong>, development, or acting as a robust offline master station.
                         </p>
                      </div>

                      <div className="space-y-8">
                          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Box size={18}/> Prerequisites</h4>
                              <ul className="list-none space-y-3 text-sm text-slate-600">
                                  <li className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      <span><strong>Node.js:</strong> You need version 18 or higher. <a href="https://nodejs.org" target="_blank" className="text-blue-600 underline">Download Here</a>.</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      <span><strong>Terminal:</strong> PowerShell (Windows) or Terminal (Mac).</span>
                                  </li>
                              </ul>
                          </div>

                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 text-lg">1. Prepare the Code</h3>
                              <p className="text-sm text-slate-600 mb-3">
                                  Download the project files to a folder on your computer (e.g., <code>Documents/KioskPro</code>).
                                  Open your terminal in that folder.
                              </p>
                              <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-600 mb-2 border border-slate-200">
                                  cd Documents/KioskPro
                              </div>
                              <p className="text-sm text-slate-600 mb-2">Install dependencies:</p>
                              <CodeBlock id="npm-install" code="npm install" />
                          </div>

                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 text-lg">2. Connect to Cloud</h3>
                              <p className="text-sm text-slate-600 mb-2">
                                  Create a new file named <code>.env</code> in the root folder (next to package.json).
                                  Paste your Supabase keys from Step 1 inside it:
                              </p>
                              <div className="p-4 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-lg mb-4 text-xs font-medium">
                                  <strong>Windows Users:</strong> If you can't create a file starting with a dot, name it <code>.env.</code> (with a trailing dot) and Windows will fix it automatically.
                              </div>
                              <CodeBlock 
                                id="env-file"
                                label=".env Content" 
                                code={`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-long-anon-key-string`} 
                              />
                          </div>

                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 text-lg">3. Launch System</h3>
                              <p className="text-sm text-slate-600 mb-2">Start the development server:</p>
                              <CodeBlock id="npm-run-dev" code="npm run dev" />
                              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                                  You will see a link like <code>http://localhost:5173</code>. 
                                  <br/>Open this in Chrome. You are now running the full Kiosk system locally!
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              {/* === TAB 3: CODE BUILD / FRONTEND === */}
              {activeTab === 'build' && (
                  <div className="p-8 animate-fade-in">
                      <div className="mb-8 border-b border-slate-100 pb-8">
                         <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest mb-4">Step 3: Code Build</div>
                         <h2 className="text-4xl font-black text-slate-900 mb-2">The Frontend Architecture</h2>
                         <p className="text-slate-600 text-lg">
                             This section explains how to modify the code and build it for production if you are self-hosting.
                         </p>
                      </div>

                      <div className="space-y-12">
                          
                          <div className="flex gap-6">
                              <div className="flex-1">
                                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Code size={20} className="text-purple-600"/> Development Environment</h3>
                                  <p className="text-sm text-slate-600 mb-4">
                                      We recommend using <strong>Visual Studio Code (VS Code)</strong>. It provides syntax highlighting for React and TypeScript.
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                          <div className="font-bold text-slate-800 text-sm mb-2">Key Files</div>
                                          <ul className="text-xs space-y-2 text-slate-600 font-mono">
                                              <li>/components <span className="text-slate-400">// UI Elements (KioskApp, Admin)</span></li>
                                              <li>/services <span className="text-slate-400">// Database logic</span></li>
                                              <li>/types.ts <span className="text-slate-400">// Data models</span></li>
                                              <li>App.tsx <span className="text-slate-400">// Main Router</span></li>
                                          </ul>
                                      </div>
                                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                          <div className="font-bold text-slate-800 text-sm mb-2">Tech Stack</div>
                                          <ul className="text-xs space-y-2 text-slate-600 font-mono">
                                              <li>React 19</li>
                                              <li>TypeScript</li>
                                              <li>Tailwind CSS</li>
                                              <li>Vite (Bundler)</li>
                                          </ul>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-6">
                              <div className="flex-1">
                                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Package size={20} className="text-purple-600"/> Building for Production</h3>
                                  <p className="text-sm text-slate-600 mb-4">
                                      If you want to host this on your own server (Apache, Nginx, IIS) instead of Vercel, you need to "Build" the static files.
                                  </p>
                                  
                                  <div className="bg-slate-900 rounded-lg p-6 shadow-lg mb-4">
                                      <div className="text-slate-400 text-xs font-bold uppercase mb-2">Terminal Command</div>
                                      <code className="font-mono text-lg text-green-400">npm run build</code>
                                  </div>

                                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                                      <h4 className="font-bold text-purple-900 text-sm mb-1">Output Folder: <code>dist/</code></h4>
                                      <p className="text-xs text-purple-800 leading-relaxed">
                                          Running the command above creates a <code>dist</code> folder. This folder contains the optimized <code>index.html</code>, JavaScript, and CSS files.
                                          <br/><br/>
                                          <strong>Deployment:</strong> Simply upload the contents of <code>dist/</code> to any web server's public html folder.
                                      </p>
                                  </div>
                              </div>
                          </div>

                      </div>
                  </div>
              )}

              {/* === TAB 4: VERCEL === */}
              {activeTab === 'vercel' && (
                  <div className="p-8 animate-fade-in">
                      <div className="mb-8 border-b border-slate-100 pb-8">
                         <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-4">Step 4: Go Live</div>
                         <h2 className="text-4xl font-black text-slate-900 mb-2">Deploy with Vercel</h2>
                         <p className="text-slate-600 text-lg">
                             Turn your code into a real URL (e.g., <code>my-kiosk.vercel.app</code>) accessible from any tablet worldwide.
                         </p>
                      </div>

                      <div className="space-y-10">
                          <div className="flex gap-6 items-start">
                              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 mb-1 text-lg">Push Code to GitHub</h4>
                                  <p className="text-sm text-slate-600 mb-2">Vercel works best with GitHub. Create a repository and upload your code.</p>
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
                                      git init<br/>
                                      git add .<br/>
                                      git commit -m "Initial commit"<br/>
                                      git branch -M main<br/>
                                      git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git<br/>
                                      git push -u origin main
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-6 items-start">
                              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 mb-1 text-lg">Connect to Vercel</h4>
                                  <p className="text-sm text-slate-600 mb-3">
                                      Go to <a href="https://vercel.com" target="_blank" className="text-blue-600 hover:underline font-bold">vercel.com</a> and sign up.
                                      <br/>Click <strong>"Add New..."</strong> &rarr; <strong>"Project"</strong>.
                                      <br/>Select your GitHub repository from the list.
                                  </p>
                              </div>
                          </div>

                          <div className="flex gap-6 items-start">
                              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-lg ring-4 ring-slate-100">3</div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Configure Environment Variables (CRITICAL)</h4>
                                  <p className="text-sm text-slate-600 mb-4">
                                      The cloud server needs to know your database keys. In the Vercel "Configure Project" screen, look for <strong>"Environment Variables"</strong>.
                                  </p>
                                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                                      <p className="text-xs font-bold text-red-800 uppercase mb-2">Add these exactly as shown:</p>
                                      <div className="space-y-2">
                                          <div className="flex flex-col md:flex-row gap-2">
                                              <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border">VITE_SUPABASE_URL</span>
                                              <span className="font-mono text-xs text-slate-500 break-all">= https://your-project.supabase.co</span>
                                          </div>
                                          <div className="flex flex-col md:flex-row gap-2">
                                              <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded border">VITE_SUPABASE_ANON_KEY</span>
                                              <span className="font-mono text-xs text-slate-500 break-all">= eyJxh... (your key)</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-6 items-start">
                              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-lg"><Check size={20}/></div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-900 mb-1 text-lg">Deploy & Install</h4>
                                  <p className="text-sm text-slate-600 mb-4">
                                      Click <strong>Deploy</strong>. Wait about 1 minute.
                                      <br/>Once deployed, visit the URL on your Tablet.
                                  </p>
                                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                      <h5 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2"><Smartphone size={16}/> Install as App (Android/iOS)</h5>
                                      <ol className="list-decimal pl-5 text-xs text-blue-800 space-y-1">
                                          <li>Open the URL in Chrome (Android) or Safari (iOS).</li>
                                          <li>Tap the Menu (Three dots) or Share button.</li>
                                          <li>Select <strong>"Add to Home Screen"</strong>.</li>
                                          <li>Launch from the new icon. It will open full-screen without browser bars.</li>
                                      </ol>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
