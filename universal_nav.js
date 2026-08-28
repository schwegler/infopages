(function() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --nav-bg: rgba(9, 9, 11, 0.8);
            --nav-border: rgba(39, 39, 42, 0.8);
            --nav-text: #a1a1aa;
            --nav-active: #f4f4f5;
            --nav-accent: #6366f1;
            --nav-height: 64px;
            --nav-font: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        body {
            padding-top: var(--nav-height);
        }

        #universal-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: var(--nav-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: var(--nav-text);
            z-index: 99999;
            font-family: var(--nav-font);
            border-bottom: 1px solid var(--nav-border);
            height: var(--nav-height);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            transition: transform 0.3s ease-in-out, background-color 0.3s ease;
            box-sizing: border-box;
        }

        #universal-nav.nav-hidden {
            transform: translateY(-100%);
        }

        /* Logo / Brand */
        #universal-nav .brand {
            font-weight: 700;
            color: #ffffff;
            text-decoration: none;
            font-size: 1.05rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            letter-spacing: -0.02em;
            white-space: nowrap;
            transition: opacity 0.2s;
        }

        #universal-nav .brand:hover,
        #universal-nav .brand:focus-visible {
            opacity: 0.9;
            outline: 2px solid var(--nav-accent);
            outline-offset: 4px;
            border-radius: 0.375rem;
        }

        /* Desktop Menu */
        #universal-nav > ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 1rem;
            align-items: center;
        }

        #universal-nav a:not(.brand) {
            color: var(--nav-text);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
            padding: 0.4rem 0.75rem;
            border-radius: 0.5rem;
            position: relative;
            white-space: nowrap;
            cursor: pointer;
        }

        #universal-nav a:not(.brand):hover,
        #universal-nav a:not(.brand):focus-visible,
        #universal-nav .dropdown:hover > a,
        #universal-nav .dropdown:focus-within > a {
            color: var(--nav-active);
            background-color: rgba(39, 39, 42, 0.6);
            outline: none;
        }

        #universal-nav a:not(.brand):focus-visible {
            ring: 2px solid var(--nav-accent);
            box-shadow: 0 0 0 2px var(--nav-accent);
        }

        /* Dropdown Styles */
        .dropdown {
            position: relative;
        }

        .dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background-color: rgba(18, 18, 20, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--nav-border);
            border-radius: 0.75rem;
            min-width: 220px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
            padding: 0.5rem;
            margin-top: 0.5rem;
            list-style: none;
            z-index: 1000;
        }

        .dropdown:hover .dropdown-menu,
        .dropdown:focus-within .dropdown-menu {
            display: block;
        }

        .dropdown-menu li {
            width: 100%;
            display: block;
        }

        .dropdown-menu a {
            display: block !important;
            width: 100%;
            padding: 8px 12px !important;
            box-sizing: border-box;
            font-size: 0.875rem !important;
            border-radius: 0.375rem;
            color: var(--nav-text) !important;
            border-bottom: none !important;
        }

        .dropdown-menu a:hover,
        .dropdown-menu a:focus-visible {
            color: var(--nav-active) !important;
            background-color: rgba(39, 39, 42, 0.8) !important;
        }

        /* Hamburger Button */
        .hamburger {
            display: none;
            flex-direction: column;
            justify-content: space-around;
            width: 2rem;
            height: 2rem;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            z-index: 100000;
        }

        .hamburger span {
            width: 1.75rem;
            height: 0.15rem;
            background: var(--nav-text);
            transition: all 0.3s ease;
            position: relative;
            transform-origin: 1px;
            border-radius: 2px;
        }

        .hamburger:hover span,
        .hamburger:focus-visible span {
            background: var(--nav-active);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
            .hamburger {
                display: flex;
            }

            #universal-nav > ul {
                position: fixed;
                top: 0;
                right: 0;
                height: 100vh;
                width: 100%;
                background-color: rgba(9, 9, 11, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                gap: 1.5rem;
                padding-top: var(--nav-height);
                overflow-y: auto;
            }

            #universal-nav > ul.open {
                transform: translateX(0);
            }

            #universal-nav a:not(.brand) {
                font-size: 1.25rem;
            }

            /* Dropdown Mobile */
            .dropdown {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.75rem;
            }

            .dropdown-menu {
                position: static;
                display: block;
                width: 100%;
                border: none;
                box-shadow: none;
                background: transparent;
                padding-left: 0;
                margin-top: 0;
            }

            .dropdown-menu li {
                text-align: center;
                margin-bottom: 0.25rem;
            }

            .dropdown-menu a {
                font-size: 1.1rem !important;
                border: none;
                padding: 6px 0 !important;
                color: var(--nav-text) !important;
            }

            .dropdown-menu a:hover {
                color: var(--nav-active) !important;
                background: transparent !important;
            }

            /* Hamburger Animation */
            .hamburger.open span:first-child {
                transform: rotate(45deg);
            }

            .hamburger.open span:nth-child(2) {
                opacity: 0;
                transform: translateX(20px);
            }

            .hamburger.open span:nth-child(3) {
                transform: rotate(-45deg);
            }
        }
    `;
    document.head.appendChild(style);

    const navLinks = [
        { name: 'Home', url: 'index.html' },
        {
            name: 'Projects',
            type: 'dropdown',
            items: [
                { name: 'Bluesky Block Checker', url: 'bsky_mutual_blocks.html' },
                { name: 'Starfleet SQL', url: 'sqlhttp.html' },
                { name: 'Buffy Migration', url: 'sqlmovebuffy.html' },
                { name: 'Hollyoaks History', url: 'hollyoaks_history.html' },
                { name: 'TNA History', url: 'tna_history.html' },
                { name: 'Gay Bars in Decline', url: 'gay_bar_closures.html' }
            ]
        },
        { name: 'Terms', url: 'tos.html' }
    ];

    const nav = document.createElement('nav');
    nav.id = 'universal-nav';

    // Brand (linked to home)
    const brand = document.createElement('a');
    brand.className = 'brand';
    brand.textContent = "Schwegler // Digital Garden";
    brand.href = 'index.html';
    nav.appendChild(brand);

    const ul = document.createElement('ul');

    navLinks.forEach(link => {
        const li = document.createElement('li');

        if (link.type === 'dropdown') {
            li.className = 'dropdown';

            // Dropdown Toggle (Label)
            const toggle = document.createElement('a');
            toggle.innerHTML = link.name + ' <span aria-hidden="true" style="font-size: 0.8em; vertical-align: middle;">&#9662;</span>';
            toggle.href = '#';
            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.addEventListener('click', (e) => e.preventDefault());
            li.appendChild(toggle);

            // Dropdown Menu
            const subUl = document.createElement('ul');
            subUl.className = 'dropdown-menu';

            link.items.forEach(item => {
                const subLi = document.createElement('li');
                const subA = document.createElement('a');
                subA.href = item.url;
                subA.textContent = item.name;

                // Highlight current page in dropdown
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                if (currentPath === item.url) {
                    subA.style.color = 'var(--nav-active)';
                    subA.style.fontWeight = '700';
                    subA.setAttribute('aria-current', 'page');
                }

                // Close menu on link click (mobile)
                subA.addEventListener('click', () => {
                     if (window.innerWidth <= 768) {
                        toggleMenu();
                     }
                });

                subLi.appendChild(subA);
                subUl.appendChild(subLi);
            });

            li.appendChild(subUl);

        } else {
            // Standard Link
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;

            // Highlight current page
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            if (currentPath === link.url) {
                a.style.color = 'var(--nav-active)';
                a.style.fontWeight = '700';
                a.setAttribute('aria-current', 'page');
            }

            // Close menu on link click (mobile)
            a.addEventListener('click', () => {
                 if (window.innerWidth <= 768) {
                    toggleMenu();
                 }
            });

            li.appendChild(a);
        }

        ul.appendChild(li);
    });

    // Hamburger Button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.ariaLabel = 'Toggle navigation';
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    hamburger.addEventListener('click', toggleMenu);

    function toggleMenu() {
        const isOpen = ul.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    nav.appendChild(ul);
    nav.appendChild(hamburger);
    document.body.prepend(nav);

    // Scroll Behavior
    let lastScrollTop = 0;
    const delta = 5;

    window.addEventListener('scroll', () => {
        const currentScrollTop = window.scrollY;

        if (Math.abs(lastScrollTop - currentScrollTop) <= delta) return;

        if (currentScrollTop > lastScrollTop && currentScrollTop > 64) {
            nav.classList.add('nav-hidden');
            if (ul.classList.contains('open')) {
                toggleMenu();
            }
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScrollTop = currentScrollTop;
    });

})();
