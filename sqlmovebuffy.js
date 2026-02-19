// --- Scroll Animations ---
const headerBg = document.getElementById('header-bg');
window.addEventListener('scroll', () => {
    document.body.style.setProperty('--scroll', window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
    const scroll = window.pageYOffset;
    headerBg.style.opacity = Math.max(0, 0.15 - (scroll / 500));
}, false);

// --- DMA Checklist ---
const dmaFindings = [
    { id: 'compat', text: 'Prophecy of Incompatibility', note: 'A number of stored procedures are using a compatibility level from a bygone era. They may not behave as expected under the new magics of SQL 2019.', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'breaking', text: 'Curse of Breaking Change', note: 'The ancient `RAISERROR` incantation has been altered. Our scripts must be updated to the new syntax, lest they curdle.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'behavior', text: 'Glamour of Behavior Change', note: 'The `COUNT` spell, when used with an `OVER` clause, now calculates things differently. A subtle glamour that could lead to disastrously incorrect reports.', icon: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 012-2h4a2 2 0 012 2M8 5v.01M16 5v.01M12 9a2 2 0 100 4 2 2 0 000-4z' },
    { id: 'deprecated', text: 'Whispers of Deprecation', note: 'The `sp_dboption` demon has been marked for death. Though it still functions, it will be vanquished in a future version. We must exorcise it now.', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }
];
const dmaChecklistEl = document.getElementById('dma-checklist');
const dmaDetailsEl = document.getElementById('dma-details');
dmaFindings.forEach(item => {
    dmaChecklistEl.innerHTML += `
        <div class="dma-item card p-4 flex items-center gap-4 cursor-pointer hover:bg-red-900/20" data-note="${item.note}">
             <svg class="h-8 w-8 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}" /></svg>
            <span class="text-lg">${item.text}</span>
        </div>
    `;
});

// Event Delegation for DMA Checklist
dmaChecklistEl.addEventListener('click', (event) => {
    const dmaItem = event.target.closest('.dma-item');
    if (dmaItem) {
        dmaDetailsEl.innerHTML = `<p class="text-lg text-yellow-200">${dmaItem.dataset.note}</p>`;
        document.querySelectorAll('.dma-item').forEach(el => el.classList.remove('bg-red-900/20'));
        dmaItem.classList.add('bg-red-900/20');
    }
});

// --- DEA Logic ---
const runDeaBtn = document.getElementById('run-dea-btn');
const deaResultsEl = document.getElementById('dea-results');

function createDeaChart(containerId, data) {
     const el = document.getElementById(containerId);
    el.innerHTML = `
        <div class="space-y-3">
            ${Object.entries(data).map(([key, value]) => `
                <div class="flex items-center">
                    <span class="w-1/3 text-gray-400">${key}</span>
                    <div class="w-2/3 bg-gray-700 rounded-full h-4">
                        <div class="bg-${value.color}-500 h-4 rounded-full" style="width: ${value.percent}%" title="${value.count}"></div>
                    </div>
                </div>`).join('')}
        </div>
        <p class="text-center mt-4 sub-heading">${data.Insight.text}</p>
    `;
}
runDeaBtn.addEventListener('click', () => {
    runDeaBtn.innerHTML = '<span class="loader"></span><span class="ml-2">Casting...</span>';
    runDeaBtn.disabled = true;
    setTimeout(() => {
        deaResultsEl.classList.remove('hidden');
        createDeaChart('dea-results-source', {
            'Improved': { count: 0, percent: 0, color: 'green' }, 'Degraded': { count: 0, percent: 0, color: 'yellow' }, 'Errors': { count: 32, percent: 2.5, color: 'red' }, 'Stable': { count: 1222, percent: 97.5, color: 'blue' }, 'Insight': {text: 'Sunnydale is stable, but prone to arcane errors.'}
        });
        createDeaChart('dea-results-target', {
            'Improved': { count: 953, percent: 76, color: 'green' }, 'Degraded': { count: 12, percent: 1, color: 'yellow' }, 'Errors': { count: 5, percent: 0.4, color: 'red' }, 'Stable': { count: 284, percent: 22.6, color: 'blue' }, 'Insight': {text: 'Cleveland is overwhelmingly faster. New magic is potent!'}
        });
        runDeaBtn.innerHTML = 'Analysis Complete';
    }, 2000);
});

// --- Dependency Map ---
const mapContainer = document.getElementById('map-container');
const svgMap = document.getElementById('dependency-map');
const servers = {
    web: { name: 'The Master\'s Lair', type: 'SQL + IIS', icon: 'M13 10V3L4 14h7v7l9-11h-7z', connections: ['api', 'data'] },
    api: { name: 'The Crypt', type: 'SQL Backend', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H21', connections: ['web'] },
    data: { name: 'The Demon\'s Roost', type: 'SQL Backend', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', connections: ['web', 'api'] }
};
const positions = { web: {top: '40%', left: '5%'}, api: {top: '5%', left: '70%'}, data: {top: '75%', left: '70%'} };

Object.keys(servers).forEach(key => {
    const serverEl = document.createElement('div');
    serverEl.id = `server-${key}`;
    serverEl.className = 'server-node absolute p-4 text-center rounded-lg card cursor-pointer';
    serverEl.style.top = positions[key].top;
    serverEl.style.left = positions[key].left;
    serverEl.innerHTML = `
        <svg class="server-icon h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${servers[key].icon}" /></svg>
        <h5 class="sub-heading text-lg">${servers[key].name}</h5>
        <p class="text-sm text-gray-500">${servers[key].type}</p>`;
    mapContainer.appendChild(serverEl);
});

const drawDepLine = (startEl, endEl) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const mapRect = mapContainer.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    line.setAttribute('x1', (startRect.left + startRect.width / 2) - mapRect.left);
    line.setAttribute('y1', (startRect.top + startRect.height / 2) - mapRect.top);
    line.setAttribute('x2', (endRect.left + endRect.width / 2) - mapRect.left);
    line.setAttribute('y2', (endRect.top + endRect.height / 2) - mapRect.top);
    line.classList.add('dependency-line');
    line.style.stroke = "#4B5563";
    svgMap.appendChild(line);
    return line;
};

setTimeout(() => {
    const lines = {};
    Object.keys(servers).forEach(startKey => {
        const startNode = document.getElementById(`server-${startKey}`);
        servers[startKey].connections.forEach(endKey => {
            const endNode = document.getElementById(`server-${endKey}`);
            const lineKey = [startKey, endKey].sort().join('-');
            if (!lines[lineKey]) {
                lines[lineKey] = drawDepLine(startNode, endNode);
            }
        });

        startNode.addEventListener('mouseenter', () => {
            Object.values(lines).forEach(l => l.style.stroke = '#374151');
            servers[startKey].connections.forEach(endKey => {
                const lineKey = [startKey, endKey].sort().join('-');
                if (lines[lineKey]) lines[lineKey].style.stroke = 'var(--magic-purple)';
            });
        });
        startNode.addEventListener('mouseleave', () => {
             Object.values(lines).forEach(l => l.style.stroke = '#4B5563');
        });
    });
}, 100);

// --- Security Armory ---
const weaponData = {
    tde: { name: 'Transparent Data Encryption', desc: 'Encrypts your database files at rest. If a demon steals your hard drive, the data is just gibberish.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: 'blue' },
    ae: { name: 'Always Encrypted', desc: 'Encrypts specific sensitive columns. The keys are held by the application, so SQL Server itself can\'t see the plaintext.', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2h2v-2h2v-2h2l1.257-1.257A6 6 0 0115 7z', color: 'purple' },
    hsts: { name: 'IIS: HSTS Protocol', desc: 'A protection spell for your website that forces browsers to only communicate over secure HTTPS, preventing downgrade attacks.', icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2', color: 'green' },
    audit: { name: 'Unified Auditing', desc: 'Meticulously logs all activity on SQL and IIS. If a demon gets in, you\'ll have a full record of its every move.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5V3a2 2 0 012-2h2a2 2 0 012 2v2', color: 'yellow' }
};
const weaponViz = document.getElementById('weapon-viz');
const weaponIcon = document.getElementById('weapon-icon');
const weaponDescEl = document.getElementById('weapon-desc');
document.querySelectorAll('.security-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const data = weaponData[btn.dataset.weapon];
        weaponViz.style.borderColor = `var(--magic-${data.color}, var(--watcher-${data.color}))`;
        weaponIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="${data.icon}" />`;
        weaponIcon.style.color = `var(--magic-${data.color}, var(--watcher-${data.color}))`;
        weaponDescEl.innerHTML = `<h5 class="text-2xl mb-2" style="color: var(--magic-${data.color}, var(--watcher-${data.color}))">${data.name}</h5><p>${data.desc}</p>`;
    });
});

// --- Cutover Ritual ---
const cutoverChecklistEl = document.getElementById('cutover-checklist');
const cutoverBtn = document.getElementById('cutover-btn');
const cutoverStatus = document.getElementById('cutover-status');
const cutoverSteps = [
    { id: 'final-log', text: 'Apply Final Log Backups', done: false },
    { id: 'iis-config', text: 'Migrate IIS Configuration', done: false },
    { id: 'deploy-app', text: 'Deploy Application Code to Cleveland', done: false },
    { id: 'validation', text: 'Run Final Data & App Validation', done: false },
    { id: 'dns', text: 'Redirect DNS to Cleveland', done: false },
    { id: 'online', text: 'Bring Cleveland Databases Online', done: false },
    { id: 'decom', text: 'Decommission Sunnydale (Salt and Burn)', done: false },
];
cutoverSteps.forEach(step => {
    cutoverChecklistEl.innerHTML += `<div class="flex items-center opacity-50 transition-opacity duration-500" id="step-${step.id}"><div class="w-8 h-8 rounded-full border-2 border-gray-500 mr-4 transition-all duration-500"></div><span>${step.text}</span></div>`;
});

let currentStep = 0;
cutoverBtn.addEventListener('click', () => {
    if (currentStep >= cutoverSteps.length) return;
    cutoverBtn.disabled = true;
    cutoverStatus.classList.remove('hidden');
    cutoverStatus.textContent = `Performing: ${cutoverSteps[currentStep].text}...`;

    setTimeout(() => {
        const stepEl = document.getElementById(`step-${cutoverSteps[currentStep].id}`);
        stepEl.classList.remove('opacity-50');
        stepEl.querySelector('div').classList.add('bg-green-500', 'transform', 'scale-110');
        stepEl.querySelector('div').style.borderColor = 'transparent';
        currentStep++;
        cutoverBtn.disabled = false;

        if (currentStep >= cutoverSteps.length) {
            cutoverStatus.textContent = 'The Hellmouth is Closed. Cleveland is Online.';
            cutoverStatus.style.color = 'var(--magic-purple)';
            cutoverBtn.style.display = 'none';
        } else {
             cutoverStatus.textContent = '';
        }
    }, 1500);
});

// --- Giles AI Logic ---
// ... as before, but prompts would be updated for new details
