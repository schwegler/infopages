(function() {
    const style = document.createElement('style');
    style.textContent = `
        #universal-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: rgba(15, 23, 42, 0.95);
            color: #fff;
            z-index: 99999;
            font-family: system-ui, -apple-system, sans-serif;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #universal-nav ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 1.5rem;
            align-items: center;
        }
        #universal-nav a {
            color: #cbd5e1;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.2s, text-shadow 0.2s;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }
        #universal-nav a:hover {
            color: #38bdf8;
            background-color: rgba(255,255,255,0.05);
        }
        @media (max-width: 768px) {
            #universal-nav {
                height: auto;
                padding: 0.5rem;
            }
            #universal-nav ul {
                flex-wrap: wrap;
                justify-content: center;
                gap: 0.5rem;
            }
        }
    `;
    document.head.appendChild(style);

    const navLinks = [
        { name: 'Home', url: 'index.html' },
        { name: 'Starfleet SQL', url: 'sqlhttp.html' },
        { name: 'Buffy Migration', url: 'sqlmovebuffy.html' },
        { name: 'Hollyoaks History', url: 'hollyoaks_history.html' },
        { name: 'TNA History', url: 'tna_history.html' },
        { name: 'Terms', url: 'tos.html' }
    ];

    // Check if we are in the 'pages' directory
    // We assume if the pathname includes '/pages/', we are in the subdirectory.
    const isPagesDir = window.location.pathname.includes('/pages/');

    const nav = document.createElement('nav');
    nav.id = 'universal-nav';

    const ul = document.createElement('ul');

    navLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        let href = link.url;
        if (isPagesDir) {
            // We are in pages/, so links to other pages are siblings
            // But link to Home (index.html) must go up one level
            if (link.url === 'index.html') {
                href = '../index.html';
            } else {
                href = link.url; // Sibling
            }
        } else {
            // We are in root (index.html)
            // Links to pages should be prefixed with pages/
            if (link.url !== 'index.html') {
                href = 'pages/' + link.url;
            }
        }

        a.href = href;
        a.textContent = link.name;

        // Highlight current page
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === link.url) {
            a.style.color = '#38bdf8';
            a.style.fontWeight = '700';
        }

        li.appendChild(a);
        ul.appendChild(li);
    });

    nav.appendChild(ul);
    document.body.prepend(nav);
})();
