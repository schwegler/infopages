document.addEventListener('DOMContentLoaded', () => {
    let appData = null;

    const yearSelect = document.getElementById('year-select');
    const characterModal = document.getElementById('character-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const timelineEventObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function buildFamilyTreeDOM(nodes) {
        if (!nodes || nodes.length === 0) return null;
        const ul = document.createElement('ul');
        nodes.forEach(node => {
            const li = document.createElement('li');
            const character = appData.characters[node.id] || { name: node.name };
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.id = node.id;
            button.className = 'character-node text-left rounded-md px-3 py-1.5 inline-block text-sm md:text-base';
            button.textContent = character.name;
            if (node.note) {
                const em = document.createElement('em');
                em.className = 'text-xs text-gray-500 font-normal';
                em.textContent = ` (${node.note})`;
                button.appendChild(em);
            }
            li.appendChild(button);
            if (node.children) {
                const childrenUL = buildFamilyTreeDOM(node.children);
                if (childrenUL) {
                    li.appendChild(childrenUL);
                }
            }
            ul.appendChild(li);
        });
        return ul;
    }

    function displayAllFamilies() {
        const allFamilyTreesContainer = document.getElementById('all-family-trees');
        if (!allFamilyTreesContainer) return;
        allFamilyTreesContainer.innerHTML = '';

        for (const familyKey in appData.familyStructures) {
            const familyData = appData.familyStructures[familyKey];
            const familySection = document.createElement('div');
            familySection.className = 'bg-blue-50 p-6 rounded-lg shadow-inner mb-6 section-reveal';

            const title = document.createElement('h3');
            title.className = 'text-2xl font-bold text-blue-800 mb-4';
            title.textContent = familyData.name;

            const treeContainer = document.createElement('div');
            treeContainer.className = 'family-tree';
            treeContainer.id = `tree-${familyKey}`;

            const treeDOM = buildFamilyTreeDOM(familyData.tree);
            if (treeDOM) {
                treeContainer.appendChild(treeDOM);
            }

            familySection.appendChild(title);
            familySection.appendChild(treeContainer);
            allFamilyTreesContainer.appendChild(familySection);
            sectionObserver.observe(familySection);
        }

        document.querySelectorAll('.character-node').forEach(node => {
            node.addEventListener('click', (e) => {
                document.querySelectorAll('.character-node').forEach(n => n.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                showCharacterModal(e.currentTarget.dataset.id);
            });
        });
    }

    function showCharacterModal(charId) {
        if (!characterModal || !modalContent) return;
        const char = appData.characters[charId];
        if (!char) {
            modalContent.innerHTML = '';
            const errorMsg = document.createElement('p');
            errorMsg.className = 'text-red-600';
            errorMsg.textContent = 'Details not available for this character.';
            modalContent.appendChild(errorMsg);
            characterModal.classList.add('is-visible');
            return;
        }

        // Filter timeline events relevant to this character and sort by year
        const relevantEvents = appData.timelineEvents.filter(event =>
            event.title.includes(char.name) || (event.description && event.description.includes(char.name))
        ).sort((a,b) => a.year - b.year);

        modalContent.innerHTML = '';

        const charName = document.createElement('h3');
        charName.className = 'text-3xl font-bold text-fuchsia-800 mb-2';
        charName.textContent = char.name;
        modalContent.appendChild(charName);

        const charSummary = document.createElement('p');
        charSummary.className = 'leading-relaxed text-gray-700';
        charSummary.textContent = char.summary || 'No summary available.';
        modalContent.appendChild(charSummary);

        if (relevantEvents.length > 0) {
            const storylinesHeader = document.createElement('h4');
            storylinesHeader.className = 'font-semibold mt-4 mb-2 text-fuchsia-700';
            storylinesHeader.textContent = 'Key Storylines:';
            modalContent.appendChild(storylinesHeader);

            const storylinesList = document.createElement('ul');
            storylinesList.className = 'list-disc list-inside space-y-1 text-gray-700';

            relevantEvents.forEach(event => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.dataset.year = event.year;
                link.className = 'event-link hover:underline text-blue-600';
                link.textContent = `${event.title} (${event.year})`;

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const year = e.target.dataset.year;
                    hideCharacterModal();
                    if (yearSelect) yearSelect.value = year;
                    displayTimeline(year);
                    const timelineSec = document.getElementById('timeline-section');
                    if (timelineSec) timelineSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });

                li.appendChild(link);
                storylinesList.appendChild(li);
            });
            modalContent.appendChild(storylinesList);
        }

        characterModal.classList.add('is-visible');
    }

    function hideCharacterModal() {
        if (characterModal) characterModal.classList.remove('is-visible');
        document.querySelectorAll('.character-node').forEach(n => n.classList.remove('selected'));
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideCharacterModal);
    if (characterModal) {
        characterModal.addEventListener('click', (e) => {
            if (e.target === characterModal) {
                hideCharacterModal();
            }
        });
    }

    function populateYearSelect() {
        if (!yearSelect) return;
        const years = [...new Set(appData.timelineEvents.map(event => event.year))].sort();
        yearSelect.innerHTML = '<option value="all">Show All Years</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    function displayTimeline(yearFilter = 'all') {
        const timelineContent = document.getElementById('timeline-content');
        if (!timelineContent) return;
        timelineContent.innerHTML = '';

        let filteredEvents = appData.timelineEvents;
        if (yearFilter !== 'all') {
            filteredEvents = appData.timelineEvents.filter(event => event.year == yearFilter);
        }

        if (filteredEvents.length === 0) {
            timelineContent.innerHTML = '<p class="text-gray-600 text-center">No major events recorded for this selection.</p>';
            return;
        }

        const eventsByYear = filteredEvents.reduce((acc, event) => {
            if (!acc[event.year]) {
                acc[event.year] = [];
            }
            acc[event.year].push(event);
            return acc;
        }, {});

        const sortedYears = Object.keys(eventsByYear).sort((a, b) => a - b);

        sortedYears.forEach(year => {
            const yearHeader = document.createElement('h3');
            yearHeader.className = 'text-3xl font-extrabold text-fuchsia-700 mt-10 mb-6 border-b-2 border-fuchsia-300 pb-2 text-center section-reveal';
            yearHeader.textContent = year;
            timelineContent.appendChild(yearHeader);
            sectionObserver.observe(yearHeader);

            eventsByYear[year].forEach(event => {
                const familyColors = {
                    cunningham: 'border-l-fuchsia-500 bg-fuchsia-50',
                    osborne: 'border-l-teal-500 bg-teal-50',
                    mcqueen: 'border-l-orange-500 bg-orange-50',
                    default: 'border-l-gray-300 bg-gray-50'
                };
                const colorClass = familyColors[event.family] || familyColors.default;

                const eventCard = document.createElement('div');
                eventCard.className = `timeline-event-card bg-white p-5 rounded-lg shadow-md border-l-4 ${colorClass} transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.01]`;

                const titleHeading = document.createElement('h4');
                titleHeading.className = 'text-xl font-semibold text-gray-800 mb-1';
                titleHeading.textContent = event.title;

                const descParagraph = document.createElement('p');
                descParagraph.className = 'text-gray-600 text-sm';
                descParagraph.textContent = event.description;

                eventCard.appendChild(titleHeading);
                eventCard.appendChild(descParagraph);

                timelineContent.appendChild(eventCard);
                timelineEventObserver.observe(eventCard);
            });
        });
    }

    if (yearSelect) yearSelect.addEventListener('change', () => displayTimeline(yearSelect.value));

    function createThematicChart() {
        const thematicElem = document.getElementById('thematicChart');
        if (!thematicElem || typeof Chart === 'undefined') return;
        const ctx = thematicElem.getContext('2d');
        const themeData = {
            '1996-2000': { 'Teen Drama': 5, 'Family Conflict': 3, 'Tragedy': 2 },
            '2001-2005': { 'Family Conflict': 4, 'Crime': 2, 'Tragedy': 3 },
            '2006-2010': { 'Crime': 6, 'Social Issue': 4, 'High Drama/Revenge': 5, 'Tragedy': 4 },
            '2011-2016': { 'Social Issue': 7, 'Serial Killer': 4, 'High Drama/Revenge': 6, 'Disaster': 2 }
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(themeData),
                datasets: [
                    { label: 'Teen/Family Drama', data: [5, 4, 0, 0], backgroundColor: '#F472B6', borderRadius: 4 },
                    { label: 'Crime/Revenge', data: [0, 2, 11, 10], backgroundColor: '#14B8A6', borderRadius: 4 },
                    { label: 'Social Issue/Tragedy', data: [5, 5, 8, 9], backgroundColor: '#6366F1', borderRadius: 4 },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { color: '#4B5563' } },
                    y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Number of Major Storylines', color: '#4B5563' }, grid: { color: '#E5E7EB' }, ticks: { color: '#4B5563' } }
                },
                plugins: {
                    title: { display: false },
                    legend: { labels: { color: '#4B5563' } },
                    tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#FFFFFF', bodyColor: '#FFFFFF', borderColor: '#F472B6', borderWidth: 1, borderRadius: 6, padding: 10 }
                }
            }
        });
    }

    createThematicChart();

    fetch('hollyoaks_data.json')
        .then(response => response.json())
        .then(data => {
            appData = data;
            displayAllFamilies();
            populateYearSelect();
            displayTimeline('all');
        })
        .catch(err => console.error('Error loading data:', err));
});
