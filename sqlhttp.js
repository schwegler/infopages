/**
 * sqlhttp.js
 * Mission Control Logic and Page Initialization
 */

export class MissionControl {
    constructor(canvas, statusElement, initiateBtn) {
        this.canvas = canvas;
        this.statusElement = statusElement;
        this.initiateBtn = initiateBtn;
        this.ctx = canvas ? canvas.getContext('2d') : null;

        this.lcarsColors = {
            blue: '#6699FF', green: '#4ade80', yellow: '#facc15', red: '#f87171', white: '#ffffff', purple: '#CC99FF', orange: '#FF9900', gray: '#6B7280'
        };

        this.missionState = { stage: 'idle', progress: 0 };
        this.pos = {
            enterprise: { x: 50, y: 0, color: this.lcarsColors.gray },
            apiStation: { x: 0, y: 0, color: this.lcarsColors.gray },
            archive: { x: 50, y: 0, color: this.lcarsColors.gray }
        };
        this.icons = {
            enterprise: 'M2,10 L18,2 L18,18 Z',
            api: 'M4 4h16v16H4z M8 8h8v8H8z',
            archive: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
            html: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
            pdf: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        };

        this.missionAnimationFrameId = null;

        this.init();
    }

    init() {
        this.setupMissionCanvas();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.setupMissionCanvas());
        }

        if (this.initiateBtn) {
            this.initiateBtn.addEventListener('click', () => this.startMission());
        }

        // Start the idle animation loop
        this.drawMission();
    }

    setupMissionCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.pos.enterprise.y = this.canvas.height / 2;
        this.pos.apiStation.x = this.canvas.width / 2;
        this.pos.apiStation.y = this.canvas.height / 2;
        this.pos.archive.y = this.canvas.height / 2;
        this.pos.archive.x = this.canvas.width - 50;
    }

    drawIcon(ctx, iconPath, x, y, color) {
        const path = new Path2D(iconPath);
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(x, y);
        ctx.fill(path);
        ctx.restore();
    }

    drawDashedLine(ctx, x1, y1, x2, y2, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawMission() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawDashedLine(this.ctx, this.pos.enterprise.x, this.pos.enterprise.y, this.pos.apiStation.x, this.pos.apiStation.y, this.lcarsColors.gray);
        this.drawDashedLine(this.ctx, this.pos.apiStation.x, this.pos.apiStation.y, this.pos.archive.x, this.pos.archive.y, this.lcarsColors.gray);

        this.drawIcon(this.ctx, this.icons.enterprise, this.pos.enterprise.x - 10, this.pos.enterprise.y - 10, this.pos.enterprise.color);
        this.drawIcon(this.ctx, this.icons.api, this.pos.apiStation.x - 12, this.pos.apiStation.y - 12, this.pos.apiStation.color);
        this.drawIcon(this.ctx, this.icons.archive, this.pos.archive.x - 12, this.pos.archive.y - 12, this.pos.archive.color);

        if (this.missionState.stage === 'transmitting_html') {
            const start = this.pos.enterprise;
            const end = this.pos.apiStation;
            const packetX = start.x + (end.x - start.x) * this.missionState.progress;
            const packetY = start.y + (end.y - start.y) * this.missionState.progress;
            this.drawIcon(this.ctx, this.icons.html, packetX - 12, packetY - 12, this.lcarsColors.yellow);
        } else if (this.missionState.stage === 'processing') {
            this.ctx.strokeStyle = this.lcarsColors.yellow;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.pos.apiStation.x, this.pos.apiStation.y, 25, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2) * this.missionState.progress);
            this.ctx.stroke();
        } else if (this.missionState.stage === 'archiving_pdf') {
            const start = this.pos.apiStation;
            const end = this.pos.archive;
            const packetX = start.x + (end.x - start.x) * this.missionState.progress;
            const packetY = start.y + (end.y - start.y) * this.missionState.progress;
            this.drawIcon(this.ctx, this.icons.pdf, packetX - 12, packetY - 12, this.lcarsColors.green);
        }

        // Bind requestAnimationFrame to 'this'
        if (typeof window !== 'undefined') {
             this.missionAnimationFrameId = window.requestAnimationFrame(() => this.drawMission());
        }
    }

    runAnimationStep(config) {
        return new Promise(resolve => {
            this.missionState.stage = config.stage;
            this.missionState.progress = 0;
            if (this.statusElement) this.statusElement.textContent = `STATUS: ${config.statusText}`;

            if (config.startColor) config.startColor();

            const startTime = Date.now();
            const step = () => {
                const elapsed = Date.now() - startTime;
                this.missionState.progress = Math.min(elapsed / config.duration, 1);
                if (this.missionState.progress < 1) {
                    if (typeof window !== 'undefined') {
                        this.missionAnimationFrameId = window.requestAnimationFrame(step);
                    }
                } else {
                    if (config.endColor) config.endColor();
                    resolve();
                }
            };
            if (typeof window !== 'undefined') {
                this.missionAnimationFrameId = window.requestAnimationFrame(step);
            }
        });
    }

    async startMission() {
        if (this.missionState.stage !== 'idle') return;

        if (typeof window !== 'undefined') {
            window.cancelAnimationFrame(this.missionAnimationFrameId);
        }

        this.pos.enterprise.color = this.lcarsColors.gray;
        this.pos.apiStation.color = this.lcarsColors.gray;
        this.pos.archive.color = this.lcarsColors.gray;

        await this.runAnimationStep({
            stage: 'transmitting_html', duration: 2000, statusText: 'TRANSMITTING HTML SCHEMATIC...',
            startColor: () => { this.pos.enterprise.color = this.lcarsColors.blue; }
        });

        await this.runAnimationStep({
            stage: 'processing', duration: 1500, statusText: 'API FABRICATING DIGITAL DOCUMENT...',
            startColor: () => { this.pos.enterprise.color = this.lcarsColors.green; this.pos.apiStation.color = this.lcarsColors.purple; }
        });

        await this.runAnimationStep({
            stage: 'archiving_pdf', duration: 2000, statusText: 'SSU ARCHIVING DOCUMENT VIA FTP...',
            startColor: () => { this.pos.apiStation.color = this.lcarsColors.green; }
        });

        this.pos.archive.color = this.lcarsColors.green;
        if (this.statusElement) {
            this.statusElement.textContent = 'STATUS: MISSION COMPLETE!';
            this.statusElement.style.color = this.lcarsColors.green;
        }

        setTimeout(() => {
            this.missionState.stage = 'idle';
             if (typeof window !== 'undefined') {
                window.cancelAnimationFrame(this.missionAnimationFrameId);
            }
            if (this.statusElement) {
                this.statusElement.textContent = 'STATUS: AWAITING ORDERS';
                this.statusElement.style.color = this.lcarsColors.white;
            }
            this.pos.enterprise.color = this.lcarsColors.gray;
            this.pos.apiStation.color = this.lcarsColors.gray;
            this.pos.archive.color = this.lcarsColors.gray;

             if (typeof window !== 'undefined') {
                window.requestAnimationFrame(() => this.drawMission());
            }
        }, 4000);
    }
}

// ... helper functions for other page logic ...
function initObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.lcars-panel-container, .section-divider, .nebula').forEach(el => observer.observe(el));
}

function initCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        const content = header.nextElementSibling;
        if (!content) return;

        if (header.classList.contains('open')) {
            content.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + "px";
        } else {
            content.style.maxHeight = '0px';
        }

        header.addEventListener('click', () => {
            header.classList.toggle('open');
            const scanline = content.querySelector('.scanline');
            if (scanline) {
                const parentContainer = scanline.parentNode;
                if (parentContainer) {
                    const newScanline = scanline.cloneNode(true);
                    const padd = parentContainer.querySelector('.code-block');
                    if (padd) {
                        newScanline.style.setProperty('--scan-height', padd.offsetHeight + 'px');
                    }
                    parentContainer.replaceChild(newScanline, scanline);
                }
            }

            if (content.style.maxHeight !== '0px') {
                content.style.maxHeight = '0px';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

function initStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    const ctx = starfield.getContext('2d');
    const numStars = 800;
    const warpThreshold = 0.9;
    let stars = [];
    let speed = 0;
    let warp = 0;

    function setup() {
        if (!starfield) return;
        starfield.width = window.innerWidth;
        starfield.height = window.innerHeight;
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: (Math.random() - 0.5) * starfield.width,
                y: (Math.random() - 0.5) * starfield.height,
                z: Math.random() * starfield.width
            });
        }
    }

    function draw() {
        if (!ctx) return;
        const centerX = starfield.width / 2;
        const centerY = starfield.height / 2;

        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,starfield.width, starfield.height);

        ctx.fillStyle = 'white';

        for(let i=0; i<numStars; i++) {
            const s = stars[i];
            s.z -= speed;
            if(s.z <= 0) {
                s.x = (Math.random() - 0.5) * starfield.width;
                s.y = (Math.random() - 0.5) * starfield.height;
                s.z = starfield.width;
            }

            const k = 128.0 / s.z;
            const px = s.x * k + centerX;
            const py = s.y * k + centerY;

            if(px >= 0 && px < starfield.width && py >= 0 && py < starfield.height) {
                let size = (1 - s.z / starfield.width) * 5;
                let shade = parseInt((1 - s.z / starfield.width) * 255);
                ctx.fillStyle = `rgb(${shade},${shade},${shade})`;

                if (warp > 0) {
                    ctx.strokeStyle = `rgba(255,255,255,${warp})`;
                    ctx.lineWidth = size;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + (s.x / s.z) * speed * 2, py + (s.y / s.z) * speed * 2);
                    ctx.stroke();
                } else {
                    ctx.fillRect(px,py,size,size);
                }
            }
        }
    }

    window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.body.offsetHeight - window.innerHeight);
        speed = scrollPercent * 20;
        warp = Math.max(0, (scrollPercent - warpThreshold) / (1 - warpThreshold));

        const nebula1 = document.getElementById('nebula1');
        const nebula2 = document.getElementById('nebula2');
        if(nebula1) nebula1.style.transform = `translateY(${-scrollPercent * 30}vh)`;
        if(nebula2) nebula2.style.transform = `translateY(${-scrollPercent * 15}vh)`;

    });

    function tick() {
        draw();
        requestAnimationFrame(tick);
    }

    setup();
    tick();
    window.addEventListener('resize', setup);
}

function initConsole() {
    const consoleOutput = document.getElementById('console-output');
    const commands = {
        clr: { btn: 'btn-clr', text: "> sp_configure 'clr enabled', 1;\n> RECONFIGURE;", delay: 500 },
        trust: { btn: 'btn-trust', text: "> ALTER DATABASE CurrentDB SET TRUSTWORTHY ON;", delay: 800 },
        deploy: { btn: 'btn-deploy', text: "> Assembly and Function Ready", delay: 100 },
    };

    function typeCommand(command) {
        let i = 0;
        const btn = document.getElementById(command.btn);
        if (btn) btn.classList.add('active');
        const interval = setInterval(() => {
            if (consoleOutput) {
                consoleOutput.textContent += command.text[i];
            }
            i++;
            if (i > command.text.length - 1) {
                if(consoleOutput) consoleOutput.textContent += '\n';
                clearInterval(interval);
            }
        }, 30);
    }

    Object.values(commands).forEach(cmd => {
        const btnEl = document.getElementById(cmd.btn);
        if (btnEl) {
            btnEl.addEventListener('click', () => {
                document.querySelectorAll('.lcars-button').forEach(b => b.classList.remove('active'));
                if(consoleOutput) consoleOutput.textContent = '';
                typeCommand(cmd)
            });
        }
    });
}

function initShields() {
    const permissionDesc = document.getElementById('permission-desc');
    const shipParts = {
        saucer: document.getElementById('saucer'),
        stardrive: document.getElementById('stardrive'),
        nacelle_port: document.getElementById('nacelle_port'),
        nacelle_starboard: document.getElementById('nacelle_starboard'),
        bridge: document.getElementById('bridge'),
        deflector: document.getElementById('deflector'),
    };
    const partMapping = {
        safe: ['bridge'],
        external: ['bridge', 'deflector'],
        unsafe: Object.keys(shipParts)
    };
    const descMapping = {
        safe: "<strong>SAFE:</strong> The Prime Directive. Code can only perform calculations. Access is restricted to the ship's computer core (the Bridge).",
        external: "<strong>EXTERNAL ACCESS:</strong> Standard Mission Protocol. Code can access external resources via the main deflector dish. Shields remain up.",
        unsafe: "<strong>UNSAFE:</strong> Red Alert! All systems are accessible, including warp drive and internal systems. Highly dangerous and rarely authorized."
    };

    document.querySelectorAll('.permission-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.permission-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const level = btn.dataset.level;

            Object.values(shipParts).forEach(part => {
                if(part) part.className.baseVal = 'ship-section-off'
            });
            partMapping[level].forEach(partKey => {
                if(shipParts[partKey]) shipParts[partKey].className.baseVal = `ship-section-${level}`;
            });
            if(permissionDesc) permissionDesc.innerHTML = descMapping[level];
        });
    });
    const initialPermissionBtn = document.querySelector('.permission-btn[data-level="external"]');
    if(initialPermissionBtn) initialPermissionBtn.click();
}

export function initPage() {
    initObserver();
    initCollapsibles();
    initStarfield();
    initConsole();
    initShields();

    const canvas = document.getElementById('mission-canvas');
    const status = document.getElementById('mission-status');
    const btn = document.getElementById('initiate-btn');
    // Instantiate MissionControl but do not attach to window global if we want to avoid side effects
    // However, the instance handles its own init in constructor/init()
    new MissionControl(canvas, status, btn);
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initPage);
}
