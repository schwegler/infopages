import { dmaFindings, servers, positions, weaponData, cutoverSteps } from './sqlmovebuffy_data.js';

export function createDeaChart(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;
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

export function initPage() {
    // --- Scroll Animations ---
    const headerBg = document.getElementById('header-bg');
    if (headerBg) {
        window.addEventListener('scroll', () => {
            document.body.style.setProperty('--scroll', window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
            const scroll = window.pageYOffset;
            headerBg.style.opacity = Math.max(0, 0.15 - (scroll / 500));
        }, false);
    }

    // --- DMA Checklist ---
    const dmaChecklistEl = document.getElementById('dma-checklist');
    const dmaDetailsEl = document.getElementById('dma-details');
    if (dmaChecklistEl && dmaDetailsEl) {
        dmaFindings.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'dma-item card p-4 flex items-center gap-4 cursor-pointer hover:bg-red-900/20';
            itemDiv.dataset.note = item.note;

            const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgEl.setAttribute('class', 'h-8 w-8 text-yellow-400 flex-shrink-0');
            svgEl.setAttribute('fill', 'none');
            svgEl.setAttribute('viewBox', '0 0 24 24');
            svgEl.setAttribute('stroke', 'currentColor');

            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('stroke-linecap', 'round');
            pathEl.setAttribute('stroke-linejoin', 'round');
            pathEl.setAttribute('stroke-width', '2');
            pathEl.setAttribute('d', item.icon);
            svgEl.appendChild(pathEl);

            const spanEl = document.createElement('span');
            spanEl.className = 'text-lg';
            spanEl.textContent = item.text;

            itemDiv.appendChild(svgEl);
            itemDiv.appendChild(spanEl);
            dmaChecklistEl.appendChild(itemDiv);
        });

        dmaChecklistEl.addEventListener('click', (event) => {
            const dmaItem = event.target.closest('.dma-item');
            if (dmaItem) {
                dmaDetailsEl.replaceChildren();
                const noteP = document.createElement('p');
                noteP.className = 'text-lg text-yellow-200';
                noteP.textContent = dmaItem.dataset.note;
                dmaDetailsEl.appendChild(noteP);
                document.querySelectorAll('.dma-item').forEach(el => el.classList.remove('bg-red-900/20'));
                dmaItem.classList.add('bg-red-900/20');
            }
        });
    }

    // --- DEA Logic ---
    const runDeaBtn = document.getElementById('run-dea-btn');
    const deaResultsEl = document.getElementById('dea-results');
    if (runDeaBtn && deaResultsEl) {
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
    }

    // --- Dependency Map ---
    const mapContainer = document.getElementById('map-container');
    const svgMap = document.getElementById('dependency-map');

    if (mapContainer && svgMap) {
        Object.keys(servers).forEach(key => {
            const serverEl = document.createElement('div');
            serverEl.id = `server-${key}`;
            serverEl.className = 'server-node absolute p-4 text-center rounded-lg card cursor-pointer';
            if (positions[key]) {
                serverEl.style.top = positions[key].top;
                serverEl.style.left = positions[key].left;
            }

            const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgEl.setAttribute('class', 'server-icon h-12 w-12 mx-auto mb-2 text-gray-400');
            svgEl.setAttribute('fill', 'none');
            svgEl.setAttribute('viewBox', '0 0 24 24');
            svgEl.setAttribute('stroke', 'currentColor');

            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('stroke-linecap', 'round');
            pathEl.setAttribute('stroke-linejoin', 'round');
            pathEl.setAttribute('stroke-width', '1.5');
            pathEl.setAttribute('d', servers[key].icon);
            svgEl.appendChild(pathEl);

            const nameEl = document.createElement('h5');
            nameEl.className = 'sub-heading text-lg';
            nameEl.textContent = servers[key].name;

            const typeEl = document.createElement('p');
            typeEl.className = 'text-sm text-gray-500';
            typeEl.textContent = servers[key].type;

            serverEl.appendChild(svgEl);
            serverEl.appendChild(nameEl);
            serverEl.appendChild(typeEl);

            mapContainer.appendChild(serverEl);
        });

        setTimeout(() => {
            const lines = {};
            const lineOps = [];
            const mapRect = mapContainer.getBoundingClientRect();

            Object.keys(servers).forEach(startKey => {
                const startNode = document.getElementById(`server-${startKey}`);
                if (!startNode) return;
                servers[startKey].connections.forEach(endKey => {
                    const lineKey = [startKey, endKey].sort().join('-');
                    if (!lines[lineKey]) {
                        const endNode = document.getElementById(`server-${endKey}`);
                        if (!endNode) return;
                        const startRect = startNode.getBoundingClientRect();
                        const endRect = endNode.getBoundingClientRect();

                        lineOps.push({
                            key: lineKey,
                            x1: (startRect.left + startRect.width / 2) - mapRect.left,
                            y1: (startRect.top + startRect.height / 2) - mapRect.top,
                            x2: (endRect.left + endRect.width / 2) - mapRect.left,
                            y2: (endRect.top + endRect.height / 2) - mapRect.top
                        });
                        lines[lineKey] = true;
                    }
                });

                startNode.addEventListener('mouseenter', () => {
                    Object.values(lines).forEach(l => { if(l && l.style) l.style.stroke = '#374151'; });
                    servers[startKey].connections.forEach(endKey => {
                        const lineKey = [startKey, endKey].sort().join('-');
                        if (lines[lineKey] && lines[lineKey].style) lines[lineKey].style.stroke = 'var(--magic-purple)';
                    });
                });
                startNode.addEventListener('mouseleave', () => {
                     Object.values(lines).forEach(l => { if(l && l.style) l.style.stroke = '#4B5563'; });
                });
            });

            lineOps.forEach(op => {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', op.x1);
                line.setAttribute('y1', op.y1);
                line.setAttribute('x2', op.x2);
                line.setAttribute('y2', op.y2);
                line.classList.add('dependency-line');
                line.style.stroke = "#4B5563";
                svgMap.appendChild(line);
                lines[op.key] = line;
            });

        }, 100);
    }

    // --- Security Armory ---
    const weaponViz = document.getElementById('weapon-viz');
    const weaponIcon = document.getElementById('weapon-icon');
    const weaponDescEl = document.getElementById('weapon-desc');
    if (weaponViz && weaponIcon && weaponDescEl) {
        document.querySelectorAll('.security-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const data = weaponData[btn.dataset.weapon];
                if (!data) return;
                weaponViz.style.borderColor = `var(--magic-${data.color}, var(--watcher-${data.color}))`;
                weaponIcon.replaceChildren();
                const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('stroke-linecap', 'round');
                pathEl.setAttribute('stroke-linejoin', 'round');
                pathEl.setAttribute('stroke-width', '1');
                pathEl.setAttribute('d', data.icon);
                svgEl.appendChild(pathEl);
                weaponIcon.appendChild(svgEl);
                weaponIcon.style.color = `var(--magic-${data.color}, var(--watcher-${data.color}))`;

                weaponDescEl.replaceChildren();
                const h5 = document.createElement('h5');
                h5.className = 'text-2xl mb-2';
                h5.style.color = `var(--magic-${data.color}, var(--watcher-${data.color}))`;
                h5.textContent = data.name;
                const p = document.createElement('p');
                p.textContent = data.desc;
                weaponDescEl.appendChild(h5);
                weaponDescEl.appendChild(p);
            });
        });
    }

    // --- Cutover Ritual ---
    const cutoverChecklistEl = document.getElementById('cutover-checklist');
    const cutoverBtn = document.getElementById('cutover-btn');
    const cutoverStatus = document.getElementById('cutover-status');

    if (cutoverChecklistEl && cutoverBtn && cutoverStatus) {
        cutoverSteps.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'flex items-center opacity-50 transition-opacity duration-500';
            stepDiv.id = `step-${step.id}`;

            const iconDiv = document.createElement('div');
            iconDiv.className = 'w-8 h-8 rounded-full border-2 border-gray-500 mr-4 transition-all duration-500';

            const spanText = document.createElement('span');
            spanText.textContent = step.text;

            stepDiv.appendChild(iconDiv);
            stepDiv.appendChild(spanText);
            cutoverChecklistEl.appendChild(stepDiv);
        });

        let currentStep = 0;
        cutoverBtn.addEventListener('click', () => {
            if (currentStep >= cutoverSteps.length) return;
            cutoverBtn.disabled = true;
            cutoverStatus.classList.remove('hidden');
            cutoverStatus.textContent = `Performing: ${cutoverSteps[currentStep].text}...`;

            setTimeout(() => {
                const stepEl = document.getElementById(`step-${cutoverSteps[currentStep].id}`);
                if (stepEl) {
                    stepEl.classList.remove('opacity-50');
                    const indicator = stepEl.querySelector('div');
                    if (indicator) {
                        indicator.classList.add('bg-green-500', 'transform', 'scale-110');
                        indicator.style.borderColor = 'transparent';
                    }
                }
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
    }

    // --- Giles AI Logic ---
    const gilesData = {
        'default': "Good heavens, are you quite sure you're ready for this? The Hellmouth is not to be trifled with.",
        'dma-checklist': "Ah, the Data Migration Assistant. A useful tome, though dreadfully dry. It identifies the 'demons' hiding in your schema—deprecated features, breaking changes. One must know one's enemy before engaging.",
        'run-dea-btn': "Testing is paramount! Willow's spell—er, the Database Experimentation Assistant—allows us to foresee the future without the nasty side effects of a prophecy. We capture the workload and replay it. Brilliant.",
        'map-container': "The logistics of this evacuation are a nightmare. We cannot simply teleport the data; we must establish a convoy. Log shipping, or rather, a continuous chain of backups. Keep the chain unbroken, or we lose everything.",
        'weapon-viz': "Cleveland may not be the Hellmouth, but it is not without its dangers. We must ward the new sanctuary. Transparent Data Encryption, Always Encrypted... think of them as protection spells that bind the data to the server.",
        'cutover-checklist': "The final ritual. Precision is key. One mispronounced syllable—or one missed configuration step—and the portal fails. Follow the checklist. Do not deviate. And for goodness sake, don't forget the salt."
    };

    const gilesToggleBtn = document.getElementById('giles-toggle-btn');
    const gilesChatWindow = document.getElementById('giles-chat-window');
    const gilesCloseBtn = document.getElementById('giles-close-btn');
    const gilesAskBtn = document.getElementById('giles-ask-btn');
    const gilesChatLog = document.getElementById('giles-chat-log');

    if (gilesToggleBtn && gilesChatWindow) {
        function toggleGiles() {
            gilesChatWindow.classList.toggle('hidden');
            gilesChatWindow.classList.toggle('flex');
            const isHidden = gilesChatWindow.classList.contains('hidden');
            gilesToggleBtn.setAttribute('aria-expanded', !isHidden);

            if (!isHidden && gilesChatLog && gilesChatLog.children.length === 0) {
                addMessage("Giles", gilesData['default']);
            }
        }

        gilesToggleBtn.addEventListener('click', toggleGiles);

        if (gilesCloseBtn) {
            gilesCloseBtn.addEventListener('click', () => {
                gilesChatWindow.classList.add('hidden');
                gilesChatWindow.classList.remove('flex');
                gilesToggleBtn.setAttribute('aria-expanded', 'false');
                gilesToggleBtn.focus();
            });
        }

        if (gilesAskBtn && gilesChatLog) {
            gilesAskBtn.addEventListener('click', () => {
                let activeKey = 'default';
                const markers = ['dma-checklist', 'run-dea-btn', 'map-container', 'weapon-viz', 'cutover-checklist'];

                for (const id of markers) {
                    const el = document.getElementById(id);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top >= 0 && rect.top <= window.innerHeight * 0.8) {
                            activeKey = id;
                            break;
                        }
                        if (rect.top < 0 && rect.bottom > window.innerHeight * 0.2) {
                            activeKey = id;
                        }
                    }
                }

                addMessage("You", "What do I do here?");
                gilesAskBtn.disabled = true;
                setTimeout(() => {
                    addMessage("Giles", gilesData[activeKey]);
                    gilesAskBtn.disabled = false;
                }, 500);
            });
        }
    }

    function addMessage(sender, text) {
        if (!gilesChatLog) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'mb-4';

        const senderSpan = document.createElement('span');
        senderSpan.className = sender === 'Giles' ? 'text-blue-400 font-bold block mb-1' : 'text-gray-400 font-bold block mb-1';
        senderSpan.textContent = sender + ': ';

        const textSpan = document.createElement('span');
        textSpan.className = 'text-gray-200';

        msgDiv.appendChild(senderSpan);
        msgDiv.appendChild(textSpan);
        gilesChatLog.appendChild(msgDiv);
        gilesChatLog.scrollTop = gilesChatLog.scrollHeight;

        if (sender === 'Giles') {
            typeText(textSpan, text);
        } else {
            textSpan.textContent = text;
        }
    }

    function typeText(element, text, index = 0) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => typeText(element, text, index + 1), 20 + Math.random() * 20);
        } else {
            if (gilesChatLog) gilesChatLog.scrollTop = gilesChatLog.scrollHeight;
        }
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initPage);
}
