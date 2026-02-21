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
        #universal-nav ul {
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
        }

        #universal-nav a:not(.brand):hover {
            color: var(--nav-hover);
            background-color: rgba(57, 255, 20, 0.1);
            text-shadow: 0 0 8px var(--nav-hover);
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
        #universal-nav a:not(.brand):hover::after {
            opacity: 1;
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

            #universal-nav ul {
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
            }

            #universal-nav ul.open {
                transform: translateX(0);
            }

            #universal-nav a:not(.brand) {
                font-size: 1.5rem;
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
        { name: 'Starfleet SQL', url: 'sqlhttp.html' },
        { name: 'Buffy Migration', url: 'sqlmovebuffy.html' },
        { name: 'Hollyoaks History', url: 'hollyoaks_history.html' },
        { name: 'TNA History', url: 'tna_history.html' },
        { name: 'Tudor Dynasty', url: 'tudor_dynasty.html' },
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
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;

        // Highlight current page
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === link.url) {
            a.style.color = 'var(--nav-hover)';
            a.style.fontWeight = '700';
            a.style.textShadow = '0 0 10px var(--nav-hover)';
        }

        // Close menu on link click (mobile)
        a.addEventListener('click', () => {
             if (window.innerWidth <= 768) {
                toggleMenu();
             }
        });

        li.appendChild(a);
        ul.appendChild(li);
    });

    // Hamburger Button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.ariaLabel = 'Toggle navigation';
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    hamburger.addEventListener('click', toggleMenu);

    function toggleMenu() {
        ul.classList.toggle('open');
        hamburger.classList.toggle('open');
        document.body.style.overflow = ul.classList.contains('open') ? 'hidden' : ''; // Prevent scrolling when menu is open
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
