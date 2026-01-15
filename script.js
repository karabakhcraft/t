// Default Data
const defaultData = {
    server: { ip: "23.88.10.122:25619", version: "1.21+(Java/bedrock)", discord: "https://discord.gg/autUT2vuQn" },
    news: [{ title: "Xoş Gəlmisiniz!", text: "KarabakhCraft artıq onlayndır! Hər kəsi gözləyirik." }],
    rules: [
        { title: "Hörmət", desc: "Bütün oyunçulara hörmətlə yanaşın." },
        { title: "Hile Qadağandır", desc: "Hər hansı bir hile və ya üstünlük verən proqram təminatından istifadə qəti qadağandır." },
        { title: "Reklam Qadağandır", desc: "Digər serverlərin və ya xidmətlərin reklamını etmək qadağandır." },
        { title: "Griefing Qadağandır", desc: "Başqalarının tikililərinə zərər vermək və ya icazəsiz əşyalarını götürmək qadağandır." },
        { title: "Söyüş və Təhqir", desc: "Çatda söyüş söymək, təhqir etmək və ya nalayiq ifadələr işlətmək qadağandır." },
        { title: "Dürüst Oyun", desc: "Oyun daxilindəki xətalardan (bug) öz xeyriniz üçün istifadə etmək qadağandır. Tapılan xətaları adminlərə bildirin." }
    ],
    faq: [
        { q: "Necə qoşulmaq olar?", a: "Server IP-ni kopyalayıb Minecraft-da əlavə edin." },
        { q: "Server hansı versiyadadır?", a: "Serverimiz 1.21+ versiyalarını dəstəkləyir." },
        { q: "VİP necə ala bilərəm?", a: "VİP və digər üstünlüklər üçün Discord kanalımıza müraciət edə bilərsiniz." },
        { q: "Mənim əşyalarım itdi, nə edim?", a: "Əgər texniki xəta baş veribsə, sübutlarla birlikdə adminlərə müraciət edin." },
        { q: "Serverdə neçə nəfər oynaya bilər?", a: "Serverimiz eyni anda 100-dən çox oyunçunu dəstəkləyə biləcek gücdədir." },
        { q: "Klan necə yarada bilərəm?", a: "Oyun daxilində /clan create komandası ilə öz klanınızı yarada bilərsiniz." }
    ],
    complaints: []
};

// State
let appData = JSON.parse(localStorage.getItem('karabakhcraft_data')) || defaultData;

// Force update version and discord if they are old
if (appData.server.version !== "1.21+" || appData.server.discord !== "https://discord.gg/autUT2vuQn") {
    appData.server.version = "1.21+";
    appData.server.discord = "https://discord.gg/autUT2vuQn";
    saveData();
}

let currentTheme = localStorage.getItem('theme') || 'dark-mode';

// Save Data
function saveData() {
    localStorage.setItem('karabakhcraft_data', JSON.stringify(appData));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Loader
    const loader = document.getElementById('loader');
    if(loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 1000);
    }

    applyTheme(currentTheme);
    renderPublicContent();
    
    // Toggles
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) themeBtn.onclick = toggleTheme;
    
    const playBtn = document.getElementById('play-now');
    if(playBtn) playBtn.onclick = copyIP;
    
    // Forms
    const loginForm = document.getElementById('login-form');
    if(loginForm) loginForm.onsubmit = handleLogin;
    
    const registerForm = document.getElementById('register-form');
    if(registerForm) registerForm.onsubmit = handleRegister;
    
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) logoutBtn.onclick = handleLogout;

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navContainer = document.getElementById('nav-container');
    if(mobileMenu && navContainer) {
        mobileMenu.onclick = () => {
            navContainer.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            if(icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        };
    }
    
    // Admin Forms
    const serverForm = document.getElementById('server-settings-form');
    if(serverForm) {
        document.getElementById('set-ip').value = appData.server.ip;
        document.getElementById('set-version').value = appData.server.version;
        document.getElementById('set-discord').value = appData.server.discord;
        serverForm.onsubmit = (e) => {
            e.preventDefault();
            appData.server.ip = document.getElementById('set-ip').value;
            appData.server.version = document.getElementById('set-version').value;
            appData.server.discord = document.getElementById('set-discord').value;
            saveData();
            alert('Yadda saxlanıldı!');
            renderPublicContent();
        };
    }

    const newsForm = document.getElementById('admin-news-form');
    if(newsForm) newsForm.onsubmit = (e) => {
        e.preventDefault();
        appData.news.push({ 
            title: document.getElementById('news-title').value, 
            text: document.getElementById('news-text').value 
        });
        saveData(); renderAdminLists(); e.target.reset();
    };

    const rulesForm = document.getElementById('admin-rules-form');
    if(rulesForm) rulesForm.onsubmit = (e) => {
        e.preventDefault();
        appData.rules.push({ 
            title: document.getElementById('rule-title').value, 
            desc: document.getElementById('rule-desc').value 
        });
        saveData(); renderAdminLists(); e.target.reset();
    };

    const faqForm = document.getElementById('admin-faq-form');
    if(faqForm) faqForm.onsubmit = (e) => {
        e.preventDefault();
        appData.faq.push({ 
            q: document.getElementById('faq-q').value, 
            a: document.getElementById('faq-a').value 
        });
        saveData(); renderAdminLists(); e.target.reset();
    };

    // Admin Access Control
    if(window.location.href.includes('admin.html')) {
        if(localStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'login.html';
        } else {
            renderAdminLists();
        }
    }

    updateAuthNav();
    initPlayerCount();
    
    // Background Music Auto-play
    const bgMusic = document.getElementById('bg-music');
    if(bgMusic) {
        bgMusic.volume = 0.3; // Set volume to 30%
        const playMusic = () => {
            bgMusic.play().catch(() => {
                // Browser might block auto-play, wait for first interaction
                document.addEventListener('click', () => bgMusic.play(), { once: true });
            });
        };
        playMusic();
        
        const musicToggle = document.getElementById('music-toggle');
        if(musicToggle) {
            musicToggle.onclick = () => {
                if(bgMusic.paused) bgMusic.play();
                else bgMusic.pause();
            };
        }
    }
});

// Functions
function applyTheme(theme) {
    document.body.className = theme;
    const icon = document.querySelector('#theme-toggle i');
    if(icon) icon.className = theme === 'light-mode' ? 'fas fa-moon' : 'fas fa-sun';
}

function toggleTheme() {
    currentTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
}

function renderPublicContent() {
    const ipEl = document.getElementById('display-ip');
    const verEl = document.getElementById('display-version');
    const discEl = document.getElementById('discord-link');
    const marketDiscEl = document.getElementById('market-discord-link');

    if(ipEl) ipEl.innerText = appData.server.ip;
    if(verEl) verEl.innerText = appData.server.version;
    if(discEl) discEl.href = appData.server.discord;
    if(marketDiscEl) marketDiscEl.href = appData.server.discord;

    const newsCont = document.getElementById('news-container');
    const ticker = document.getElementById('news-ticker-content');
    if(newsCont) {
        newsCont.innerHTML = appData.news.map(n => `
            <div class="news-card">
                <h3>${n.title}</h3>
                <p>${n.text}</p>
            </div>
        `).join('');
    }
    if(ticker) {
        ticker.innerHTML = appData.news.map(n => `<span>${n.title}: ${n.text}</span>`).join(' | ');
    }

    const rulesCont = document.getElementById('rules-container');
    if(rulesCont) {
        rulesCont.innerHTML = appData.rules.map((r, i) => `
            <div class="rule-item">
                <h3>${i+1}. ${r.title}</h3>
                <p>${r.desc}</p>
            </div>
        `).join('');
    }

    const faqCont = document.getElementById('faq-container');
    if(faqCont) {
        faqCont.innerHTML = appData.faq.map(f => `
            <div class="faq-item">
                <h3>Q: ${f.q}</h3>
                <p>A: ${f.a}</p>
            </div>
        `).join('');
    }
}

function renderAdminLists() {
    const newsList = document.getElementById('admin-news-list');
    if(newsList) newsList.innerHTML = appData.news.map((n, i) => `<div class="admin-item"><span>${n.title}</span><button onclick="deleteItem('news', ${i})" class="btn-small">Sil</button></div>`).join('');

    const rulesList = document.getElementById('admin-rules-list');
    if(rulesList) rulesList.innerHTML = appData.rules.map((r, i) => `<div class="admin-item"><span>${r.title}</span><button onclick="deleteItem('rules', ${i})" class="btn-small">Sil</button></div>`).join('');

    const faqList = document.getElementById('admin-faq-list');
    if(faqList) faqList.innerHTML = appData.faq.map((f, i) => `<div class="admin-item"><span>${f.q}</span><button onclick="deleteItem('faq', ${i})" class="btn-small">Sil</button></div>`).join('');
}

window.deleteItem = (type, index) => {
    appData[type].splice(index, 1);
    saveData(); renderAdminLists();
};

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    if(u === 'Elmir' && p === 'Ayxan2008') {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentUser', u);
        window.location.href = 'admin.html';
    } else {
        // Fake user login
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('currentUser', u);
        window.location.href = 'index.html';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById('reg-username').value;
    localStorage.setItem('isAdmin', 'false');
    localStorage.setItem('currentUser', u);
    window.location.href = 'index.html';
}

function handleLogout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function copyIP() {
    navigator.clipboard.writeText(appData.server.ip).then(() => {
        const t = document.getElementById('toast');
        if(t) {
            t.style.display = 'block'; 
            setTimeout(() => t.style.display = 'none', 2000);
        }
    });
}

function updateAuthNav() {
    const nav = document.getElementById('auth-nav');
    if(!nav) return;
    
    const user = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if(user) {
        nav.innerHTML = `
            <span style="margin-right:10px;">Xoş gəldin, <strong>${user}</strong></span>
            ${isAdmin ? '<a href="admin.html" class="btn-small" style="background:var(--primary-color);">Admin</a>' : ''}
            <button onclick="handleLogout()" class="btn-small" style="background:#e74c3c;">Çıxış</button>
        `;
    }
}

function initPlayerCount() {
    const el = document.getElementById('online-count');
    if(!el) return;
    
    // Use a more reliable way to get the IP and port
    const fullIP = appData.server.ip;
    
    const updateCount = () => {
        // Using mcapi.us as an alternative or primary source
        fetch(`https://mcapi.us/server/status?ip=${fullIP.split(':')[0]}&port=${fullIP.split(':')[1] || 25565}`)
            .then(r => r.json())
            .then(d => {
                if (d.online) {
                    el.innerText = d.players.now;
                } else {
                    // Fallback to mcsrvstat if mcapi fails or shows offline
                    return fetch(`https://api.mcsrvstat.us/2/${fullIP}`);
                }
            })
            .then(r => r ? r.json() : null)
            .then(d => {
                if (d && d.online) {
                    el.innerText = d.players.online;
                } else if (!el.innerText || el.innerText === '...') {
                    el.innerText = '0';
                }
            })
            .catch(() => {
                if (!el.innerText || el.innerText === '...') el.innerText = '0';
            });
    };

    updateCount();
    // Update every 60 seconds
    setInterval(updateCount, 60000);
}

window.showTab = (id) => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
};

window.buyPackage = (packageName) => {
    const discordLink = appData.server.discord;
    const message = `Mən ${packageName} paketini almaq istəyirəm!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${discordLink}`, '_blank');
    
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = `${packageName} üçün Discord-a yönləndirildiniz!`;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    }
};
