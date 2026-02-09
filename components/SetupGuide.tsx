
import React, { useState } from 'react';
import { 
  X, Database, SmartphoneNfc, Bot, Container, Table, 
  Terminal, Globe, Cloud, ShieldCheck, Zap, Code2, 
  ChevronRight, Copy, CheckCircle2, Server, Key, FolderSync,
  HelpCircle, Cpu, Network, Layout, Smartphone, BookOpen, Info
} from 'lucide-react';

interface SetupGuideProps {
  onClose: () => void;
}

const WhyBox = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-4">
        <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2">
            <HelpCircle size={14} /> Why do I need this?
        </div>
        <p className="text-xs text-slate-300 leading-relaxed italic">
            {children}
        </p>
    </div>
);

const SetupGuide: React.FC<SetupGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'server' | 'bridge' | 'tunnel' | 'apk'>('intro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const Section = ({ icon: Icon, title, desc, children }: any) => (
    <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{desc}</p>
            </div>
        </div>
        {children}
    </div>
  );

  const CodeBox = ({ label, code, id }: any) => (
    <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12}/> {label}
            </span>
            <button 
                onClick={() => copy(code, id)}
                className="p-1.5 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all"
            >
                {copiedId === id ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
        </div>
        <div className="p-5 overflow-x-auto">
            <pre className="text-xs text-blue-300 font-mono leading-relaxed whitespace-pre">{code}</pre>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 text-slate-200 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-2xl relative">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck size={20} className="text-white" /></div>
              <div>
                  <div className="text-base font-black uppercase tracking-tight text-white">Kiosk <span className="text-blue-500">Master Guide</span></div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">End-to-End Deployment Tutorial</div>
              </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-slate-900/50 border-r border-slate-800 p-4 space-y-2 overflow-y-auto shrink-0">
              {[
                  { id: 'intro', label: '0. The Blueprint', icon: Layout, color: 'text-slate-400' },
                  { id: 'server', label: '1. The Cloud Brain', icon: Server, color: 'text-blue-400' },
                  { id: 'tunnel', label: '2. The Global Link', icon: Globe, color: 'text-green-400' },
                  { id: 'bridge', label: '3. Magic Sync', icon: FolderSync, color: 'text-cyan-400' },
                  { id: 'apk', label: '4. Native Android', icon: SmartphoneNfc, color: 'text-yellow-400' },
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${activeTab === tab.id ? 'bg-slate-800 border border-slate-700 shadow-xl' : 'hover:bg-slate-800/30 border border-transparent'}`}
                  >
                      <div className={`p-2 rounded-lg bg-slate-950 ${activeTab === tab.id ? 'shadow-inner' : ''}`}>
                          <tab.icon size={18} className={tab.color} />
                      </div>
                      <div className="text-left">
                          <div className={`text-[11px] font-black uppercase tracking-wide ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.label}</div>
                      </div>
                  </button>
              ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
              <div className="max-w-3xl mx-auto pb-20">
                  
                  {activeTab === 'intro' && (
                    <Section icon={Layout} title="The Ecosystem Blueprint" desc="Understanding how the parts fit together">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-500"><Network size={120} /></div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase">The 3 Pillars of your Kiosk</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 font-black">1</div>
                                        <div>
                                            <h4 className="font-black text-white uppercase text-sm">The Cloud Server (The Brain)</h4>
                                            <p className="text-xs text-slate-400 mt-1">A script running on your PC that stores all products, images, and settings. It tells every tablet what to show.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shrink-0 font-black">2</div>
                                        <div>
                                            <h4 className="font-black text-white uppercase text-sm">The Global Tunnel (The Bridge)</h4>
                                            <p className="text-xs text-slate-400 mt-1">A secure connection that allows tablets in any store (even in other cities) to talk to your PC safely.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center shrink-0 font-black">3</div>
                                        <div>
                                            <h4 className="font-black text-white uppercase text-sm">The Android APK (The Face)</h4>
                                            <p className="text-xs text-slate-400 mt-1">The actual app installed on the tablet. It locks the device into "Kiosk Mode" and looks professional.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('server')}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase p-5 rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                Start Step 1: Set up the Brain <ChevronRight />
                            </button>
                        </div>
                    </Section>
                  )}

                  {activeTab === 'server' && (
                      <Section icon={Server} title="Step 1: The Cloud Brain" desc="Setting up your centralized API server">
                          <WhyBox>
                              Without a server, your kiosk is just a static website. You would have to manually update every tablet one-by-one. 
                              With this server, you update your PC, and 100 tablets update instantly.
                          </WhyBox>

                          <div className="space-y-4 mb-8">
                              <h4 className="font-black uppercase text-xs text-blue-400">Preparation</h4>
                              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 ml-2">
                                  <li>Download and install <b>Node.js</b> from nodejs.org.</li>
                                  <li>Create a new folder on your PC named <code className="bg-slate-800 px-1">KioskServer</code>.</li>
                                  <li>Open a terminal (CMD) in that folder and run: <br/> 
                                      <code className="bg-black text-green-400 p-2 block mt-2 rounded">npm init -y && npm install express multer cors</code>
                                  </li>
                              </ol>
                          </div>

                          <CodeBox 
                            label="server.js (Save this file inside your folder)"
                            id="node-server"
                            code={`const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

const CONFIG_FILE = './kiosk_config.json';
const FLEET_FILE = './fleet_registry.json';
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

app.get('/api/config', (req, res) => {
    if (!fs.existsSync(CONFIG_FILE)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(CONFIG_FILE)));
});

app.post('/api/config', (req, res) => {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['host'];
    res.json({ url: \`\${protocol}://\${host}/uploads/\${req.file.filename}\` });
});

app.post('/api/heartbeat', (req, res) => {
    let fleet = fs.existsSync(FLEET_FILE) ? JSON.parse(fs.readFileSync(FLEET_FILE)) : [];
    const idx = fleet.findIndex(k => k.id === req.body.id);
    if (idx > -1) fleet[idx] = { ...fleet[idx], ...req.body };
    else fleet.push(req.body);
    fs.writeFileSync(FLEET_FILE, JSON.stringify(fleet, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(\`Kiosk Brain Active on Port \${PORT}\`));`}
                          />
                          <p className="text-xs text-slate-500 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                              Run the server by typing <code className="text-blue-400">node server.js</code> in your terminal. You should see "Kiosk Brain Active".
                          </p>
                      </Section>
                  )}

                  {activeTab === 'tunnel' && (
                      <Section icon={Globe} title="Step 2: The Global Link" desc="Making your server accessible from anywhere">
                          <WhyBox>
                              Your PC is hidden behind your home or store router. If you try to connect a tablet from another WiFi, it won't see your PC. 
                              Cloudflare creates a secure, encrypted "tunnel" through your router so the tablets can find your PC safely.
                          </WhyBox>

                          <div className="space-y-6">
                              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                  <h4 className="text-white font-black uppercase text-xs mb-4">The Quick Method</h4>
                                  <ol className="text-xs text-slate-400 space-y-4 list-decimal list-inside">
                                      <li>Install <b>Cloudflared</b> (Search "Cloudflare Tunnel download").</li>
                                      <li>Open a new terminal and type the command below:</li>
                                  </ol>
                                  <CodeBox 
                                    label="Terminal Command"
                                    id="cf-cmd"
                                    code={`cloudflared tunnel --url http://localhost:3001`}
                                  />
                                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                                      <p className="text-xs text-yellow-500 font-bold">
                                          Look for a URL ending in <span className="underline">.trycloudflare.com</span> in your terminal output. 
                                          COPY THIS URL. It is the secret address for your kiosks.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </Section>
                  )}

                  {activeTab === 'bridge' && (
                      <Section icon={FolderSync} title="Step 3: Magic Content Sync" desc="Drop a file on your PC, see it on the tablet">
                          <WhyBox>
                              Entering product data manually is slow. With the "Sync Bridge", you can create a folder on your Desktop. 
                              Whenever you drag a video or image into that folder, this script detects it and sends it to your Global Cloud.
                          </WhyBox>

                          <CodeBox 
                            label="bridge.js (Run this on your main PC)"
                            id="bridge-script"
                            code={`const chokidar = require('chokidar');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Replace this with the URL from your Cloudflare Tunnel in Step 2
const API_URL = 'https://YOUR_TUNNEL_URL.trycloudflare.com'; 
const WATCH_FOLDER = './KioskAssets'; 

if (!fs.existsSync(WATCH_FOLDER)) fs.mkdirSync(WATCH_FOLDER);

console.log('🚀 Sync Bridge Active. Drag files into:', path.resolve(WATCH_FOLDER));

chokidar.watch(WATCH_FOLDER, { persistent: true }).on('add', async (filePath) => {
  const fileName = path.basename(filePath);
  if (fileName.startsWith('.')) return;

  console.log('✨ Sending file to Cloud:', fileName);
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const res = await axios.post(\`\${API_URL}/api/upload\`, form, { headers: form.getHeaders() });
    console.log('✅ Global URL:', res.data.url);
  } catch (err) { console.error('❌ Sync Failed:', err.message); }
});`}
                          />
                      </Section>
                  )}

                  {activeTab === 'apk' && (
                      <Section icon={SmartphoneNfc} title="Step 4: The Android APK" desc="Turning your website into a real App">
                          <WhyBox>
                              Web browsers have address bars, refresh buttons, and can be closed by customers. 
                              An APK (Android Package) makes the app "Native". It fills the whole screen, prevents users from exiting, and performs 2x faster.
                          </WhyBox>

                          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0"><Code2 size={16}/></div>
                                    <div className="flex-1">
                                        <h5 className="font-black text-white uppercase text-xs mb-1">1. Build the Web Core</h5>
                                        <p className="text-[11px] text-slate-500 mb-2">Compiles your code into a lightweight bundle.</p>
                                        <code className="bg-black text-blue-400 p-2 rounded block text-[10px]">npm run build</code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0"><Cpu size={16}/></div>
                                    <div className="flex-1">
                                        <h5 className="font-black text-white uppercase text-xs mb-1">2. Inject into Hardware</h5>
                                        <p className="text-[11px] text-slate-500 mb-2">Moves the bundle into the Android Studio project.</p>
                                        <code className="bg-black text-purple-400 p-2 rounded block text-[10px]">npx cap sync android</code>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0"><Smartphone size={16}/></div>
                                    <div className="flex-1">
                                        <h5 className="font-black text-white uppercase text-xs mb-1">3. Generate APK</h5>
                                        <p className="text-[11px] text-slate-500 mb-2">Opens Android Studio. Click "Build" -> "Build APK".</p>
                                        <code className="bg-black text-green-400 p-2 rounded block text-[10px]">npx cap open android</code>
                                    </div>
                                </div>
                          </div>

                          <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-center">
                              <h4 className="font-black uppercase text-lg mb-2">Setup Complete!</h4>
                              <p className="text-sm font-bold opacity-80 mb-4">Install the APK on your tablet and enter your Tunnel URL in the settings.</p>
                              <button onClick={onClose} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black uppercase text-xs">Return to Dashboard</button>
                          </div>
                      </Section>
                  )}

              </div>
          </div>
      </div>
    </div>
  );
};

export default SetupGuide;
