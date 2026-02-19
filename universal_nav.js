(function() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --nav-bg: rgba(15, 23, 42, 0.95);
            --nav-text: #cbd5e1;
            --nav-hover: #38bdf8;
            --nav-height: 60px;
        }

        #universal-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background-color: var(--nav-bg);
            color: #fff;
            z-index: 99999;
            font-family: system-ui, -apple-system, sans-serif;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            height: var(--nav-height);
            display: flex;
            align-items: center;
            justify-content: space-between; /* Changed from center to space-between for brand/hamburger */
            padding: 0 1.5rem;
            transition: transform 0.3s ease-in-out;
            box-sizing: border-box;
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
            display: block; /* Always visible */
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
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.2s, text-shadow 0.2s;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }

        #universal-nav a:not(.brand):hover {
            color: var(--nav-hover);
            background-color: rgba(255,255,255,0.05);
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
            background: #fff;
            border-radius: 10px;
            transition: all 0.3s linear;
            position: relative;
            transform-origin: 1px;
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
                padding-top: var(--nav-height); /* Space for header */
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
        { name: 'Terms', url: 'tos.html' }
    ];

    const nav = document.createElement('nav');
    nav.id = 'universal-nav';

    // Brand (linked to home)
    const brand = document.createElement('a');
    brand.className = 'brand';
    brand.textContent = "Schwegler's Digital Garden";
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
            a.style.color = '#38bdf8';
            a.style.fontWeight = '700';
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

        // Make sure they scroll more than delta
        if (Math.abs(lastScrollTop - currentScrollTop) <= delta) return;

        // If they scrolled down and are past the navbar, add class .nav-hidden.
        // If they scrolled up or they are at the top, remove .nav-hidden
        if (currentScrollTop > lastScrollTop && currentScrollTop > 60) {
            // Scroll Down
            nav.classList.add('nav-hidden');
            // Close mobile menu if scrolling down
            if (ul.classList.contains('open')) {
                toggleMenu();
            }
        } else {
            // Scroll Up
            nav.classList.remove('nav-hidden');
        }

        lastScrollTop = currentScrollTop;
    });

})();
