(function() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --nav-bg: #000000;
            --nav-text: #cccccc;
            --nav-hover: #39ff14;
            --nav-height: 60px;
            --nav-font: 'Courier New', Courier, monospace;
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
            color: var(--nav-text);
            z-index: 99999;
            font-family: var(--nav-font);
            border-bottom: 2px solid var(--nav-hover);
            height: var(--nav-height);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            transition: transform 0.3s ease-in-out;
            box-sizing: border-box;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        #universal-nav.nav-hidden {
            transform: translateY(-100%);
        }

        /* Logo / Brand */
        #universal-nav .brand {
            font-weight: 700;
            color: #fff;
            text-decoration: none;
            font-size: 1.1rem;
            display: block;
            text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
            white-space: nowrap;
        }

        /* Desktop Menu */
        #universal-nav > ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 1.5rem;
            align-items: center;
        }

        #universal-nav a:not(.brand) {
            color: var(--nav-text);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.2s;
            padding: 0.5rem;
            position: relative;
            white-space: nowrap;
            cursor: pointer;
        }

        #universal-nav a:not(.brand):hover,
        #universal-nav a:not(.brand):focus-visible,
        #universal-nav .dropdown:hover > a,
        #universal-nav .dropdown:focus-within > a {
            color: var(--nav-hover);
            background-color: rgba(57, 255, 20, 0.1);
            text-shadow: 0 0 8px var(--nav-hover);
            outline: 1px solid var(--nav-hover);
        }

        #universal-nav a:not(.brand)::before {
            content: '[';
            margin-right: 5px;
            opacity: 0;
            transition: opacity 0.2s;
            color: var(--nav-hover);
        }
        #universal-nav a:not(.brand)::after {
            content: ']';
            margin-left: 5px;
            opacity: 0;
            transition: opacity 0.2s;
            color: var(--nav-hover);
        }
        #universal-nav a:not(.brand):hover::before,
        #universal-nav a:not(.brand):hover::after,
        #universal-nav a:not(.brand):focus-visible::before,
        #universal-nav a:not(.brand):focus-visible::after,
        #universal-nav .dropdown:hover > a::before,
        #universal-nav .dropdown:hover > a::after,
        #universal-nav .dropdown:focus-within > a::before,
        #universal-nav .dropdown:focus-within > a::after {
            opacity: 1;
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
            background-color: var(--nav-bg);
            border: 1px solid var(--nav-hover);
            min-width: 250px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
            padding: 0;
            margin: 0;
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
            padding: 10px 15px !important;
            box-sizing: border-box;
            font-size: 0.85rem !important;
            border-bottom: 1px solid #333;
        }

        .dropdown-menu li:last-child a {
            border-bottom: none;
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
            width: 2rem;
            height: 0.25rem;
            background: var(--nav-text);
            transition: all 0.3s linear;
            position: relative;
            transform-origin: 1px;
        }

        .hamburger:hover span {
            background: var(--nav-hover);
            box-shadow: 0 0 5px var(--nav-hover);
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
                background-color: var(--nav-bg);
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transform: translateX(100%);
                transition: transform 0.3s ease-in-out;
                gap: 2rem;
                padding-top: var(--nav-height);
                border-left: 2px solid var(--nav-hover);
                overflow-y: auto; /* Allow scrolling if menu is long */
            }

            #universal-nav > ul.open {
                transform: translateX(0);
            }

            #universal-nav a:not(.brand) {
                font-size: 1.5rem;
            }

            /* Dropdown Mobile */
            .dropdown {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            .dropdown-menu {
                position: static;
                display: block; /* Always visible on mobile */
                width: 100%;
                border: none;
                box-shadow: none;
                background: transparent;
                padding-left: 0;
            }

            .dropdown-menu li {
                text-align: center;
                margin-bottom: 0.5rem;
            }

            .dropdown-menu a {
                font-size: 1.2rem !important;
                border: none;
                padding: 5px 0 !important;
                color: #888 !important;
            }

            .dropdown-menu a:hover {
                color: var(--nav-hover) !important;
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
            toggle.href = '#'; // Or javascript:void(0)
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
                    subA.style.color = 'var(--nav-hover)';
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
                a.style.color = 'var(--nav-hover)';
                a.style.fontWeight = '700';
                a.style.textShadow = '0 0 10px var(--nav-hover)';
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
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    hamburger.addEventListener('click', toggleMenu);

    function toggleMenu() {
        ul.classList.toggle('open');
        hamburger.classList.toggle('open');
        const isOpen = ul.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : ''; // Prevent scrolling when menu is open
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

        if (currentScrollTop > lastScrollTop && currentScrollTop > 60) {
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
