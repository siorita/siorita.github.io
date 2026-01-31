// Mock System State
let systemState = {
    state: "OFF",
    mode: "MANUAL",
    command: "STOP",
    interval: 30,
    duration: 300,
    lastUpdated: new Date().toISOString()
};

// Load state from localStorage if available
const savedState = localStorage.getItem('bird_deterrent_state');
if (savedState) {
    try {
        const parsed = JSON.parse(savedState);
        // Map old structure if exists or use new one
        systemState.state = parsed.state || parsed.status || "OFF";
        systemState.mode = parsed.mode || "MANUAL";
        systemState.interval = parsed.interval || (parsed.settings ? parsed.settings.interval : 30);
        systemState.duration = parsed.duration || (parsed.settings ? parsed.settings.duration : 300);
        systemState.command = parsed.command || "STOP";
        systemState.lastUpdated = parsed.lastUpdated || new Date().toISOString();
    } catch (e) {
        console.error("Failed to parse saved state", e);
    }
}

function saveState() {
    systemState.lastUpdated = new Date().toISOString();
    localStorage.setItem('bird_deterrent_state', JSON.stringify(systemState));
}

/**
 * MOCK API SERVICE
 * Simulates network latency and real API behavior
 */
const MockAPI = {
    async getStatus() {
        console.log("Mock API: GET /status");
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ ...systemState });
            }, 500); // 500ms latency
        });
    },

    async sendCommand(action, payload = null) {
        console.log(`Mock API: POST /command - ${action}`, payload);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let message = "Command executed";
                systemState.command = action;
                
                switch (action) {
                    case "START":
                        systemState.state = "ON";
                        message = "System started";
                        break;
                    case "STOP":
                        systemState.state = "OFF";
                        message = "System stopped";
                        break;
                    case "SET_MODE_AUTO":
                        systemState.mode = "AUTO";
                        message = "Switched to Automatic Mode";
                        break;
                    case "SET_MODE_MANUAL":
                        systemState.mode = "MANUAL";
                        message = "Switched to Manual Mode";
                        break;
                    case "PLAY_MAGPIE":
                        message = "Playing Magpie Alarm Sound...";
                        break;
                    case "PLAY_HAWK":
                        message = "Playing Hawk Cry...";
                        break;
                    case "UPDATE_SETTINGS":
                        if (payload && payload.interval && payload.duration) {
                            systemState.interval = Number(payload.interval);
                            systemState.duration = Number(payload.duration);
                            message = "Settings saved";
                        } else {
                            return reject(new Error("Invalid settings payload"));
                        }
                        break;
                    default:
                        return reject(new Error("Unknown command"));
                }

                saveState();
                resolve({
                    success: true,
                    message: message,
                    data: { ...systemState }
                });
            }, 600); // 600ms latency
        });
    }
};

/**
 * PRODUCTION API SERVICE
 * Used when MOCK_MODE is false
 */
const RealAPI = {
    async getStatus() {
        // Replace with your real cloud API URL
        const API_URL = "https://siorita.github.io/status.json"; 
        const AUTH_TOKEN = "15";

        const response = await fetch(API_URL, {
            headers: { 'Authorization': AUTH_TOKEN }
        });
        if (!response.ok) throw new Error("API Error");
        return await response.json();
    },

    async sendCommand(action, payload = null) {
        const API_URL = "https://your-cloud-api.com/command";
        const AUTH_TOKEN = "Bearer your-secret-token";

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({ action, payload })
        });
        if (!response.ok) throw new Error("API Error");
        return await response.json();
    }
};

// TOGGLE THIS FOR PRODUCTION
const USE_MOCK = false;
const API = USE_MOCK ? MockAPI : RealAPI;

// DOM Elements
const els = {
    statusPower: document.getElementById('status-power'),
    statusMode: document.getElementById('status-mode'),
    statusConnection: document.getElementById('status-connection'),
    btnStart: document.getElementById('btn-start'),
    btnStop: document.getElementById('btn-stop'),
    btnMagpie: document.getElementById('btn-magpie'),
    btnHawk: document.getElementById('btn-hawk'),
    btnAuto: document.getElementById('btn-auto'),
    btnManual: document.getElementById('btn-manual'),
    inputInterval: document.getElementById('interval'),
    inputDuration: document.getElementById('duration'),
    settingsForm: document.getElementById('settings-form'),
    feedback: document.getElementById('feedback-message')
};

// Helper: Show Feedback Message
function showFeedback(message, type = 'success') {
    els.feedback.textContent = message;
    els.feedback.className = `feedback ${type}`;
    els.feedback.classList.remove('hidden');
    
    setTimeout(() => {
        els.feedback.classList.add('hidden');
    }, 3000);
}

// UI Update: Connection Status
function updateConnectionStatus(isConnected) {
    if (isConnected) {
        els.statusConnection.textContent = "●";
        els.statusConnection.className = "value dot connected";
        els.statusConnection.title = "Connected";
    } else {
        els.statusConnection.textContent = "●";
        els.statusConnection.className = "value dot disconnected";
        els.statusConnection.title = "Disconnected";
    }
}

// UI Update: System Status
function updateStatusUI(data) {
    if (!data) return;

    els.statusPower.textContent = data.state || "UNKNOWN";
    els.statusMode.textContent = data.mode || "UNKNOWN";
    
    if (data.interval !== undefined) {
        if (document.activeElement !== els.inputInterval) {
            els.inputInterval.value = data.interval;
        }
    }
    if (data.duration !== undefined) {
        if (document.activeElement !== els.inputDuration) {
            els.inputDuration.value = data.duration;
        }
    }
}

// Logic: Fetch Status
async function fetchStatus() {
    try {
        const data = await API.getStatus();
        updateConnectionStatus(true);
        updateStatusUI(data);
    } catch (error) {
        console.error('Fetch failed:', error);
        updateConnectionStatus(false);
        showFeedback("Connection Error", "error");
    }
}

// Logic: Send Command
async function executeCommand(action, payload = null) {
    try {
        const response = await API.sendCommand(action, payload);
        updateConnectionStatus(true);
        if (response.success) {
            showFeedback(response.message, 'success');
            updateStatusUI(response.data);
        }
    } catch (error) {
        console.error('Command failed:', error);
        updateConnectionStatus(false);
        showFeedback("Command Failed", "error");
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    setInterval(fetchStatus, 5000);

    els.btnStart.addEventListener('click', () => executeCommand('START'));
    els.btnStop.addEventListener('click', () => executeCommand('STOP'));
    els.btnMagpie.addEventListener('click', () => executeCommand('PLAY_MAGPIE'));
    els.btnHawk.addEventListener('click', () => executeCommand('PLAY_HAWK'));
    els.btnAuto.addEventListener('click', () => executeCommand('SET_MODE_AUTO'));
    els.btnManual.addEventListener('click', () => executeCommand('SET_MODE_MANUAL'));

    els.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const interval = els.inputInterval.value;
        const duration = els.inputDuration.value;
        executeCommand('UPDATE_SETTINGS', { interval, duration });
    });
});
