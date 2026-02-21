const tudorData = {
    intro: {
        title: "The Tudor Accession and the Imperative of the Male Heir",
        text: `The reign of Henry VIII (1509–1547) is fundamentally defined by the convergence of personal desire, dynastic necessity, and constitutional revolution. While popular historical narratives frequently reduce the lives of his six consorts to a tragic mnemonic of survival and execution, a rigorous scholarly examination reveals that these women were central to the transformation of England from a peripheral Catholic kingdom into a centralized, sovereign Protestant power. The King’s pursuit of a male heir and his subsequent marital turbulence necessitated a break with the Roman Catholic Church, a redistribution of national wealth through the dissolution of the monasteries, and a radical redefinition of the monarch’s legal and spiritual authority.<br><br>
        The stability of the Tudor dynasty was a primary concern for Henry VIII throughout his reign. Having ascended the throne as only the second monarch of a house that emerged from the chaos of the Wars of the Roses, Henry was acutely aware that a disputed succession could plunge the realm back into civil strife. In the early 16th century, the standard of the time dictated that a legitimate male heir was essential for the continuity and stability of a royal house. This anxiety over the succession served as the primary motive for Henry's marital maneuvers, eventually driving him to acts of significant political and religious disruption.`
    },
    wives: [
        {
            id: "catherine-aragon",
            name: "Catherine of Aragon",
            subtitle: "The Diplomatic Anchor",
            tenure: "1509–1533",
            outcome: "Mary I (Surviving daughter)",
            fate: "Annulled; Died in seclusion",
            fate_short: "Annulled",
            color: "#C5A059", // Gold
            bio: `Catherine of Aragon, the youngest daughter of Ferdinand II of Aragon and Isabella I of Castile, was initially betrothed to Henry’s older brother, Arthur, as part of a strategic alliance between England and the newly unified Spain. Following Arthur’s death in 1502, Catherine’s position was precarious. She was effectively held as a political prisoner while the English and Spanish crowns debated her dowry of 200,000 crowns. During this period, she demonstrated remarkable resilience, becoming the first female European ambassador in history in 1507, representing the Aragonese crown in England.<br><br>
            When Henry VIII married Catherine in 1509, the union required a papal dispensation because she was his brother’s widow, a relationship considered an impediment of "affinity" in canon law. The dispensation was granted based on the premise that Catherine’s marriage to Arthur had never been consummated. For nearly two decades, the marriage appeared stable. Catherine was a cultured and competent regent while Henry campaigned in France between 1512 and 1514, even overseeing the victory against the Scots at the Battle of Flodden in 1513.<br><br>
            However, the lack of a male heir—despite at least six pregnancies and the birth of Princess Mary in 1516—eventually led Henry to question the legitimacy of the union. By 1527, Henry became convinced that his marriage was cursed by God, citing Leviticus 20:21. The refusal of Pope Clement VII to grant an annulment was not merely theological but profoundly political, as Catherine was the aunt of the Holy Roman Emperor Charles V.`,
            extra: {
                title: "The Legal Impasse",
                content: "Facing a stalemate with the Pope, Henry, advised by Thomas Cromwell and Thomas Cranmer, began to argue that England was an 'empire' and that its king was not subject to any external jurisdiction. This led to the Reformation Parliament of 1529–1536 and the Act in Restraint of Appeals (1533), allowing Cranmer to declare the marriage null and void."
            }
        },
        {
            id: "anne-boleyn",
            name: "Anne Boleyn",
            subtitle: "The Reformation Catalyst",
            tenure: "1533–1536",
            outcome: "Elizabeth I (Surviving daughter)",
            fate: "Executed for treason",
            fate_short: "Executed",
            color: "#8A0303", // Red
            bio: `Anne Boleyn’s role in English history is inextricably linked to the radical transformation of the English church and the concept of royal sovereignty. Unlike Catherine, who represented the traditional order, Anne was a product of the sophisticated French court and brought a new "Renaissance spirit" to Henry’s household. Her influence was not merely romantic; she was a staunch advocate for religious reform, introducing Henry to evangelical texts that supported his desire for spiritual autonomy.<br><br>
            The secret marriage of Henry and Anne in January 1533 was a bold challenge to papal authority. The subsequent birth of Princess Elizabeth in September 1533, while a disappointment to a King desperate for a son, further solidified the break from Rome. Anne remained a powerful figure at court, using her position to patronize scholars and promote the use of the English Bible.<br><br>
            However, her failure to produce a male heir in subsequent pregnancies began to sour her relationship with Henry. By 1536, the political landscape had shifted. The charges brought against Anne in May 1536—adultery with five men, including her brother, and plotting the King's death—were almost certainly fabricated, yet served as a necessary mechanism for her legal destruction.`,
            acts: [
                { act: "Submission of the Clergy (1532)", impact: "Transferred all religious authority to the monarch." },
                { act: "Ecclesiastical Appeals Act (1533)", impact: "Broadened the monarchy's reign over religious affairs." },
                { act: "Act of Supremacy (1534)", impact: "Formalized the King as Supreme Head of the Church of England." },
                { act: "Treasons Act (1534)", impact: "Made it high treason to deny the King's supremacy." }
            ]
        },
        {
            id: "jane-seymour",
            name: "Jane Seymour",
            subtitle: "The Biological Imperative",
            tenure: "1536–1537",
            outcome: "Edward VI (Surviving son)",
            fate: "Died following childbirth",
            fate_short: "Died",
            color: "#E2E8F0", // White/Silver
            bio: `Jane Seymour married Henry VIII just eleven days after Anne Boleyn’s execution. Traditionally portrayed as the "meek and mild" alternative to the abrasive Anne, Jane’s agency is often minimized in historical accounts. However, modern historiography suggests that Jane was a strategic conservative who intentionally cultivated a traditionalist household, enforcing strict moral codes and reverting to the gable hood to distinguish herself from the reformist French styles of her predecessor.<br><br>
            Jane’s primary significance lies in her biological success. In October 1537, she gave birth to the future Edward VI, fulfilling Henry’s long-standing desire for a legitimate male heir. Her death less than two weeks later from puerperal fever was a devastating blow to the King, and she remained the only wife to be buried alongside him at Windsor. The tragedy of Jane Seymour highlights the extreme risks of Tudor queenship, where the physical act of providing an heir was the most critical, yet most dangerous, service a consort could perform.`
        },
        {
            id: "anne-cleves",
            name: "Anne of Cleves",
            subtitle: "The Survivor",
            tenure: "1540",
            outcome: "None",
            fate: "Annulled; Lived as 'King's Sister'",
            fate_short: "Annulled",
            color: "#C5A059", // Gold
            bio: `Following a long period of mourning for Jane Seymour, Henry’s ministers sought a foreign Protestant ally against the Catholic powers of Europe. The choice fell on Anne of Cleves, the daughter of a German duke. However, upon meeting her in person in early 1540, Henry was immediately repulsed, claiming she did not resemble her portrait by Hans Holbein.<br><br>
            Anne of Cleves represents a unique model of agency through acquiescence. Recognizing the danger of resisting the King, she cooperated with the annulment proceedings, testifying that the marriage had never been consummated. In return, Henry granted her a generous settlement, including the title of "the King’s Sister," an annual pension, and several homes such as Hever Castle and Richmond Palace. By prioritizing survival and social status over regnal power, Anne of Cleves became one of the wealthiest and most independent women in England.`
        },
        {
            id: "catherine-howard",
            name: "Catherine Howard",
            subtitle: "The Victim of Factionalism",
            tenure: "1540–1542",
            outcome: "None",
            fate: "Executed for adultery",
            fate_short: "Executed",
            color: "#8A0303", // Red
            bio: `The marriage of Henry VIII to the teenage Catherine Howard in July 1540 was a triumph for the conservative Howard faction. Catherine, a cousin of Anne Boleyn, was around 17 years old, while Henry was in his late forties, obese, and suffering from chronic health issues. Traditionally dismissed as "frivolous," modern re-evaluations highlight the systemic abuse she suffered.<br><br>
            Catherine’s pre-marital relationships were later used as evidence against her, viewed now through the lens of grooming and predatory behavior by older men within her household. When her past was revealed to Henry, followed by allegations of a relationship with Thomas Culpeper, the King’s reaction was one of betrayal and rage. She was executed at the Tower of London in February 1542. Her downfall demonstrated the vulnerability of women who were utilized as pawns by powerful families to gain access to the King’s favor.`
        },
        {
            id: "katherine-parr",
            name: "Katherine Parr",
            subtitle: "The Intellectual Consort",
            tenure: "1543–1547",
            outcome: "None",
            fate: "Survived the King",
            fate_short: "Survived",
            color: "#00F0FF", // Blue/Cyan
            bio: `The final marriage to Katherine Parr in 1543 signaled a shift toward a more mature and intellectual partnership. Katherine, a twice-widowed woman of significant learning, served not merely as a nursemaid to the aging King but as a powerful advocate for religious reform. She was the first woman in England to publish a book under her own name, <em>Prayers or Meditations</em>, and she was a key figure in the education of the royal children, particularly Elizabeth.<br><br>
            Katherine’s survival required a sophisticated understanding of court politics. In 1546, she narrowly escaped arrest for heresy when conservative factions attempted to turn the King against her. By skillfully appealing to Henry’s vanity and claiming her intellectual pursuits were merely a way to better discuss religion with him, she regained his trust. Henry’s final act of confidence was naming her Queen Regent in the event of his death.`
        }
    ],
    legal: {
        intro: `The marital history of Henry VIII did not merely result in personal tragedies; it was the catalyst for profound legal and constitutional changes that continue to influence English law. The dissolution of his marriages necessitated the creation of new legal frameworks that shifted authority from the church to the state. The "Great Matter" of Henry’s first divorce fundamentally altered the relationship between canon law and civil law, setting a precedent for the state’s involvement in marriage that would eventually lead to the secularization of divorce.`,
        rights: [
            { right: "Independent Property", desc: "Could buy, sell, and lease lands without the King's concurrence." },
            { right: "Right to Sue/Be Sued", desc: "Could initiate legal action or be sued independently of her husband." },
            { right: "Separate Court", desc: "Maintained distinct courts and legal officers (Attorney/Solicitor General)." },
            { right: "Separate Property", desc: "Could hold goods and lands and dispose of them by will." },
            { right: "Treason Status", desc: "Her person was secured on the same legal footing as the King." }
        ]
    },
    cultural: {
        intro: `The historical perception of Henry VIII’s wives has evolved from rigid Victorian archetypes toward more nuanced, feminist-informed interpretations in the 21st century. The pop musical <em>Six</em> has become a cultural touchstone, explicitly challenging the narrative that these women are defined only by their deaths. By portraying the wives as a modern girl band, the musical allows them to "write their own endings" and speak directly to modern audiences.`,
        six_data: [
            { character: "Catherine of Aragon", inspiration: "Beyoncé", theme: "Dignity, resilience, and refusal to be set aside." },
            { character: "Anne Boleyn", inspiration: "Avril Lavigne", theme: "Rebel against court norms and religious convention." },
            { character: "Jane Seymour", inspiration: "Adele", theme: "The tragic mother and the 'beloved' ideal." },
            { character: "Anne of Cleves", inspiration: "Rihanna / Nicki Minaj", theme: "Pragmatic survival and independent wealth." },
            { character: "Catherine Howard", inspiration: "Ariana Grande", theme: "Victimhood, sexual grooming, and predatory systems." },
            { character: "Katherine Parr", inspiration: "Alicia Keys", theme: "Intellectual achievement and the scholar-queen." }
        ]
    },
    conclusion: "The six wives of Henry VIII remain objects of enduring fascination because their stories sit at the intersection of the personal and the political. They were the crucible through which the modern English state was forged. Their legacy is not merely one of tragedy, but of significant legal and social transformation. By moving beyond the familiar rhyme, we uncover a history of six distinct, complex women whose influence on the English psyche and legal system continues to resonate in the modern world."
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initCanvas();
    initCharts();
});

function initApp() {
    // 1. Render Intro
    const introEl = document.getElementById('intro-text');
    if (introEl) introEl.innerHTML = tudorData.intro.text;

    // 2. Render Wife Selector
    renderWifeSelector();

    // 3. Render Legal Section
    const legalTextEl = document.getElementById('legal-text');
    if (legalTextEl) legalTextEl.innerHTML = tudorData.legal.intro;

    const legalListEl = document.getElementById('legal-list');
    if (legalListEl) {
        tudorData.legal.rights.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-3 p-2 hover:bg-white/5 transition-colors";
            li.innerHTML = `<span class="text-[var(--royal-gold)]">➜</span> <div><strong class="text-white block">${item.right}</strong> <span class="text-gray-400">${item.desc}</span></div>`;
            legalListEl.appendChild(li);
        });
    }

    // 4. Render Cultural Section
    const culturalTextEl = document.getElementById('cultural-text');
    if (culturalTextEl) culturalTextEl.innerHTML = tudorData.cultural.intro;

    const sixTableBody = document.getElementById('six-table-body');
    if (sixTableBody) {
        tudorData.cultural.six_data.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = "border-b border-gray-800 hover:bg-white/5 transition-colors";
            tr.innerHTML = `
                <td class="py-3 font-bold text-white">${row.character}</td>
                <td class="py-3 text-[var(--holo-blue)]">${row.inspiration}</td>
                <td class="py-3 italic text-gray-400 text-xs">${row.theme}</td>
            `;
            sixTableBody.appendChild(tr);
        });
    }

    // 5. Conclusion
    const conclusionEl = document.getElementById('conclusion-text');
    if (conclusionEl) conclusionEl.textContent = tudorData.conclusion;

    // Default Selection
    selectWife(0);
}

function renderWifeSelector() {
    const container = document.getElementById('wife-selector');
    if (!container) return;

    tudorData.wives.forEach((wife, index) => {
        const btn = document.createElement('button');
        btn.className = "glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer group";
        btn.onclick = () => selectWife(index);
        btn.innerHTML = `
            <div class="w-12 h-12 rounded-full border-2 border-[var(--royal-gold)] flex items-center justify-center bg-black text-[var(--royal-gold)] font-bold text-sm group-hover:bg-[var(--royal-gold)] group-hover:text-black transition-colors">
                ${wife.name.charAt(0)}
            </div>
            <div class="text-xs text-center text-gray-400 group-hover:text-white uppercase tracking-wider">${wife.name.split(' ')[0]}</div>
        `;
        container.appendChild(btn);
    });
}

function selectWife(index) {
    const wife = tudorData.wives[index];
    const detailView = document.getElementById('detail-view');

    // Fade out
    detailView.style.opacity = '0';
    detailView.style.transform = 'translateY(10px)';

    setTimeout(() => {
        // Update Content
        document.getElementById('wife-name').textContent = wife.name;
        document.getElementById('wife-subtitle').textContent = wife.subtitle;
        document.getElementById('wife-tenure').textContent = wife.tenure;
        document.getElementById('wife-outcome').textContent = wife.outcome;
        document.getElementById('wife-fate-short').textContent = wife.fate_short;
        document.getElementById('wife-bio').innerHTML = wife.bio;

        // Portrait Placeholder
        const portraitEl = document.getElementById('wife-portrait-placeholder');
        portraitEl.textContent = wife.name.charAt(0);
        portraitEl.style.color = wife.color;

        // Status Color
        const statusEl = document.getElementById('wife-fate-short');
        if (wife.fate_short === "Executed") statusEl.className = "text-[#8A0303] font-bold uppercase";
        else if (wife.fate_short === "Survived" || wife.fate_short === "Annulled") statusEl.className = "text-[#C5A059] font-bold uppercase";
        else statusEl.className = "text-gray-400 font-bold uppercase";

        // Extra Content (Acts, etc)
        const extraContainer = document.getElementById('wife-extra-content');
        extraContainer.innerHTML = '';
        extraContainer.className = "hidden"; // Reset

        if (wife.acts) {
            extraContainer.className = "block mt-6 bg-black/40 p-4 border-l-2 border-[var(--royal-gold)]";
            let html = `<h5 class="text-[var(--royal-gold)] font-bold mb-3 uppercase text-xs tracking-widest">Legislative Impact</h5><ul class="space-y-2 text-sm text-gray-400">`;
            wife.acts.forEach(act => {
                html += `<li><strong class="text-white">${act.act}</strong>: ${act.impact}</li>`;
            });
            html += `</ul>`;
            extraContainer.innerHTML = html;
        } else if (wife.extra) {
            extraContainer.className = "block mt-6 bg-black/40 p-4 border-l-2 border-[var(--royal-gold)]";
            extraContainer.innerHTML = `<h5 class="text-[var(--royal-gold)] font-bold mb-2 uppercase text-xs tracking-widest">${wife.extra.title}</h5><p class="text-sm text-gray-400">${wife.extra.content}</p>`;
        }

        // Fade in
        detailView.style.opacity = '1';
        detailView.style.transform = 'translateY(0)';

        // Highlight active button
        const buttons = document.getElementById('wife-selector').children;
        Array.from(buttons).forEach((btn, idx) => {
            if (idx === index) btn.classList.add('holo-active');
            else btn.classList.remove('holo-active');
        });

    }, 300);
}

function initCharts() {
    // 1. Fate Distribution Chart
    const fateCtx = document.getElementById('fateChart').getContext('2d');
    new Chart(fateCtx, {
        type: 'doughnut',
        data: {
            labels: ['Divorced/Annulled', 'Beheaded/Executed', 'Died', 'Survived'],
            datasets: [{
                data: [2, 2, 1, 1], // Aragon, Cleves | Boleyn, Howard | Seymour | Parr
                backgroundColor: ['#C5A059', '#8A0303', '#E2E8F0', '#00F0FF'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#ccc', font: { family: 'Orbitron' } } }
            }
        }
    });

    // 2. Tenure Chart (Years)
    // Aragon: 24, Boleyn: 3, Seymour: 1, Cleves: <1, Howard: 2, Parr: 4
    const tenureCtx = document.getElementById('tenureChart').getContext('2d');
    new Chart(tenureCtx, {
        type: 'bar',
        data: {
            labels: ['Aragon', 'Boleyn', 'Seymour', 'Cleves', 'Howard', 'Parr'],
            datasets: [{
                label: 'Years Married',
                data: [24, 3, 1.5, 0.5, 1.5, 3.5], // Approx
                backgroundColor: ['#C5A059', '#8A0303', '#E2E8F0', '#C5A059', '#8A0303', '#00F0FF'],
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#ccc' } },
                x: { grid: { display: false }, ticks: { color: '#ccc', font: { family: 'Cinzel' } } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Background Canvas Animation (Subtle Particles)
function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.alpha = Math.random() * 0.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = `rgba(197, 160, 89, ${this.alpha})`; // Gold dust
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw some connecting lines for "constellation" effect
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}
