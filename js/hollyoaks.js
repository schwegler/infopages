
let appData = {};

document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('year-select');
    const characterModal = document.getElementById('character-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalContent = document.getElementById('modal-content');

    // Intersection Observer for section reveal animations
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                sectionObserver.unobserve(entry.target); // Observe once
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the section is visible

    document.querySelectorAll('.section-reveal').forEach(section => {
        sectionObserver.observe(section);
    });

    // Intersection Observer for timeline event card animations
    const timelineEventObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                timelineEventObserver.unobserve(entry.target); // Observe once
            }
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the card is visible

    function buildFamilyTreeHTML(nodes) {
        if (!nodes || nodes.length === 0) return '';
        let html = '<ul>';
        nodes.forEach(node => {
            const character = appData.characters[node.id] || { name: node.name };
            html += `<li><button type="button" data-id="${node.id}" class="character-node rounded-md px-3 py-1.5 inline-block text-sm md:text-base text-left">${character.name} ${node.note ? `<em class="text-xs text-gray-500 font-normal">(${node.note})</em>` : ''}</button>`;
            if (node.children) {
                html += buildFamilyTreeHTML(node.children);
            }
            html += '</li>';
        });
        html += '</ul>';
        return html;
    }

    function displayAllFamilies() {
        const allFamilyTreesContainer = document.getElementById('all-family-trees');
        allFamilyTreesContainer.innerHTML = '';

        for (const familyKey in appData.familyStructures) {
            const familyData = appData.familyStructures[familyKey];
            const familySection = document.createElement('div');
            familySection.className = 'bg-blue-50 p-6 rounded-lg shadow-inner mb-6 section-reveal'; // Light blue background for family cards
            familySection.innerHTML = `
                <h3 class="text-2xl font-bold text-blue-800 mb-4">${familyData.name}</h3>
                <div class="family-tree" id="tree-${familyKey}">
                    ${buildFamilyTreeHTML(familyData.tree)}
                </div>
            `;
            allFamilyTreesContainer.appendChild(familySection);
            sectionObserver.observe(familySection); // Observe for animation
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
        const char = appData.characters[charId];
        if (!char) {
            modalContent.innerHTML = `<p class="text-red-600">Details not available for this character.</p>`;
            characterModal.classList.add('is-visible');
            return;
        }

        let eventsHtml = '';
        // Filter timeline events relevant to this character and sort by year
        const relevantEvents = appData.timelineEvents.filter(event =>
            event.title.includes(char.name) || (event.description && event.description.includes(char.name))
        ).sort((a,b) => a.year - b.year);

        if (relevantEvents.length > 0) {
            eventsHtml = '<h4 class="font-semibold mt-4 mb-2 text-fuchsia-700">Key Storylines:</h4><ul class="list-disc list-inside space-y-1 text-gray-700">';
            relevantEvents.forEach(event => {
                eventsHtml += `<li><a href="#" data-year="${event.year}" class="event-link hover:underline text-blue-600">${event.title} (${event.year})</a></li>`;
            });
            eventsHtml += '</ul>';
        }

        modalContent.innerHTML = `
            <h3 class="text-3xl font-bold text-fuchsia-800 mb-2">${char.name}</h3>
            <p class="leading-relaxed text-gray-700">${char.summary || 'No summary available.'}</p>
            ${eventsHtml}
        `;
        characterModal.classList.add('is-visible');

        modalContent.querySelectorAll('.event-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const year = e.target.dataset.year;
                hideCharacterModal();
                yearSelect.value = year;
                displayTimeline(year);
                document.getElementById('timeline-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function hideCharacterModal() {
        characterModal.classList.remove('is-visible');
        document.querySelectorAll('.character-node').forEach(n => n.classList.remove('selected'));
    }

    closeModalBtn.addEventListener('click', hideCharacterModal);
    characterModal.addEventListener('click', (e) => {
        if (e.target === characterModal) {
            hideCharacterModal();
        }
    });

    function populateYearSelect() {
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
                eventCard.innerHTML = `
                    <h4 class="text-xl font-semibold text-gray-800 mb-1">${event.title}</h4>
                    <p class="text-gray-600 text-sm">${event.description}</p>
                `;
                timelineContent.appendChild(eventCard);
                timelineEventObserver.observe(eventCard);
            });
        });
    }

    yearSelect.addEventListener('change', () => displayTimeline(yearSelect.value));

    function createThematicChart() {
        const ctx = document.getElementById('thematicChart').getContext('2d');
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
                    { label: 'Teen/Family Drama', data: [5, 4, 0, 0], backgroundColor: '#F472B6', borderRadius: 4 }, /* Pink 400 */
                    { label: 'Crime/Revenge', data: [0, 2, 11, 10], backgroundColor: '#14B8A6', borderRadius: 4 }, /* Teal 500 */
                    { label: 'Social Issue/Tragedy', data: [5, 5, 8, 9], backgroundColor: '#6366F1', borderRadius: 4 }, /* Indigo 500 */
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: '#4B5563' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Major Storylines', color: '#4B5563' },
                        grid: { color: '#E5E7EB' },
                        ticks: { color: '#4B5563' }
                    }
                },
                plugins: {
                    title: { display: false },
                    legend: { labels: { color: '#4B5563' } },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#F472B6',
                        borderWidth: 1,
                        borderRadius: 6,
                        padding: 10
                    }
                }
            }
        });
    }

    // Initial setup
    createThematicChart();

    fetch('../data/hollyoaks_data.json')
        .then(response => response.json())
        .then(data => {
            appData = data;
            displayAllFamilies();
            populateYearSelect();
            displayTimeline('all');
        })
        .catch(err => console.error('Error loading data:', err));
});
