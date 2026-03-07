import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Read the script content once
const scriptPath = path.join(process.cwd(), 'universal_nav.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

describe('universal_nav.js', () => {

    function setupDOM() {
        // Mock Element class
        class MockElement {
            constructor(tagName) {
                this.tagName = tagName;
                this.id = '';
                this._className = '';
                this.textContent = '';
                this.href = '';
                this.ariaLabel = '';
                this.innerHTML = '';
                this.children = [];
                this.eventListeners = {};
                this.style = {};

                const self = this;
                this.classList = {
                    classes: new Set(),
                    add: function(cls) { this.classes.add(cls); self._className = Array.from(this.classes).join(' '); },
                    remove: function(cls) { this.classes.delete(cls); self._className = Array.from(this.classes).join(' '); },
                    toggle: function(cls) {
                        if (this.classes.has(cls)) {
                            this.classes.delete(cls);
                            self._className = Array.from(this.classes).join(' ');
                            return false;
                        } else {
                            this.classes.add(cls);
                            self._className = Array.from(this.classes).join(' ');
                            return true;
                        }
                    },
                    contains: function(cls) { return this.classes.has(cls); }
                };
            }

            set className(val) {
                this._className = val;
                this.classList.classes = new Set(val.split(' ').filter(Boolean));
            }

            get className() {
                return this._className;
            }

            appendChild(child) {
                this.children.push(child);
            }

            prepend(child) {
                this.children.unshift(child);
            }

            addEventListener(event, callback) {
                if (!this.eventListeners[event]) {
                    this.eventListeners[event] = [];
                }
                this.eventListeners[event].push(callback);
            }

            click() {
                if (this.eventListeners['click']) {
                    this.eventListeners['click'].forEach(cb => cb({ preventDefault: () => {} }));
                }
            }
        }

        // Mock window
        global.window = {
            innerWidth: 1024,
            scrollY: 0,
            location: {
                pathname: '/index.html'
            },
            eventListeners: {},
            addEventListener: function(event, callback) {
                if (!this.eventListeners[event]) {
                    this.eventListeners[event] = [];
                }
                this.eventListeners[event].push(callback);
            },
            dispatchEvent: function(event) {
                if (this.eventListeners[event.type]) {
                    this.eventListeners[event.type].forEach(cb => cb());
                }
            }
        };

        // Mock document
        global.document = {
            createElement: (tagName) => new MockElement(tagName),
            head: new MockElement('head'),
            body: new MockElement('body'),
            eventListeners: {},
            addEventListener: function(event, callback) {
                if (!this.eventListeners[event]) {
                    this.eventListeners[event] = [];
                }
                this.eventListeners[event].push(callback);
            }
        };
    }

    beforeEach(() => {
        setupDOM();
        // Execute the script in the mocked environment
        eval(scriptContent);
    });

    afterEach(() => {
        delete global.window;
        delete global.document;
    });

    test('injects style into head and prepends nav to body', () => {
        // Verify style injection
        assert.strictEqual(global.document.head.children.length, 1);
        const styleElement = global.document.head.children[0];
        assert.strictEqual(styleElement.tagName, 'style');
        assert.ok(styleElement.textContent.includes(':root {'));
        // Check for presence of nav background variable instead of specific color
        assert.ok(styleElement.textContent.includes('--nav-bg:') || styleElement.textContent.includes('--unav-bg:'));

        // Verify nav prepended to body
        assert.strictEqual(global.document.body.children.length, 1);
        const navElement = global.document.body.children[0];
        assert.strictEqual(navElement.tagName, 'nav');
        assert.strictEqual(navElement.id, 'universal-nav');
    });

    test('generates standard links and dropdown items based on configuration', () => {
        const navElement = global.document.body.children[0];
        const ulElement = navElement.children.find(child => child.tagName === 'ul');
        assert.ok(ulElement, 'Expected ul element inside nav');

        // Check number of main nav items (Home, Projects, Terms)
        assert.strictEqual(ulElement.children.length, 3);

        // 1. Home
        const homeLi = ulElement.children[0];
        const homeA = homeLi.children[0];
        assert.strictEqual(homeA.textContent, 'Home');
        assert.strictEqual(homeA.href, 'index.html');
        // Since pathname is mocked to '/index.html', it should have highlight styles
        assert.strictEqual(homeA.style.color, 'var(--nav-hover)');

        // 2. Projects (dropdown)
        const projectsLi = ulElement.children[1];
        assert.ok(projectsLi.classList.contains('dropdown'));
        const toggleA = projectsLi.children[0];
        assert.strictEqual(toggleA.textContent, 'Projects');
        const dropdownUl = projectsLi.children[1];
        assert.strictEqual(dropdownUl.className, 'dropdown-menu');

        // Check dropdown items
        assert.strictEqual(dropdownUl.children.length, 5);
        const starfleetA = dropdownUl.children[0].children[0];
        assert.strictEqual(starfleetA.textContent, 'Starfleet SQL');
        assert.strictEqual(starfleetA.href, 'sqlhttp.html');
        const gayBarsA = dropdownUl.children[4].children[0];
        assert.strictEqual(gayBarsA.textContent, 'Gay Bars in Decline');
        assert.strictEqual(gayBarsA.href, 'gay_bar_closures.html');

        // 3. Terms
        const termsLi = ulElement.children[2];
        const termsA = termsLi.children[0];
        assert.strictEqual(termsA.textContent, 'Terms');
        assert.strictEqual(termsA.href, 'tos.html');
    });

    test('hamburger toggle menu toggles classes and body overflow', () => {
        const navElement = global.document.body.children[0];
        const ulElement = navElement.children.find(child => child.tagName === 'ul');
        const hamburgerBtn = navElement.children.find(child => child.tagName === 'button' && child.className.includes('hamburger'));

        assert.ok(hamburgerBtn, 'Hamburger button should exist');
        assert.ok(!ulElement.classList.contains('open'));
        assert.ok(!hamburgerBtn.classList.contains('open'));
        assert.notStrictEqual(global.document.body.style.overflow, 'hidden');

        // Click to open
        hamburgerBtn.click();

        assert.ok(ulElement.classList.contains('open'));
        assert.ok(hamburgerBtn.classList.contains('open'));
        assert.strictEqual(global.document.body.style.overflow, 'hidden');

        // Click to close
        hamburgerBtn.click();

        assert.ok(!ulElement.classList.contains('open'));
        assert.ok(!hamburgerBtn.classList.contains('open'));
        assert.strictEqual(global.document.body.style.overflow, '');
    });

    test('scroll event hides and shows nav based on threshold', () => {
        const navElement = global.document.body.children[0];
        assert.ok(!navElement.classList.contains('nav-hidden'));

        // Scroll down slightly (less than threshold 60)
        global.window.scrollY = 30;
        global.window.dispatchEvent({ type: 'scroll' });
        assert.ok(!navElement.classList.contains('nav-hidden'), 'Nav should not be hidden < 60px');

        // Scroll down past threshold (> 60px) and past delta (5)
        global.window.scrollY = 70;
        global.window.dispatchEvent({ type: 'scroll' });
        assert.ok(navElement.classList.contains('nav-hidden'), 'Nav should be hidden > 60px');

        // Scroll up (should show nav)
        global.window.scrollY = 60;
        global.window.dispatchEvent({ type: 'scroll' });
        assert.ok(!navElement.classList.contains('nav-hidden'), 'Nav should be visible when scrolling up');

        // Scroll down a little bit (less than delta 5)
        global.window.scrollY = 64;
        global.window.dispatchEvent({ type: 'scroll' });
        assert.ok(!navElement.classList.contains('nav-hidden'), 'Nav should still be visible because delta <= 5');
    });

    test('scroll event hides nav and closes open menu', () => {
        const navElement = global.document.body.children[0];
        const ulElement = navElement.children.find(child => child.tagName === 'ul');
        const hamburgerBtn = navElement.children.find(child => child.tagName === 'button' && child.className.includes('hamburger'));

        // Open menu
        hamburgerBtn.click();
        assert.ok(ulElement.classList.contains('open'));

        // Scroll down past threshold
        global.window.scrollY = 100;
        global.window.dispatchEvent({ type: 'scroll' });

        assert.ok(navElement.classList.contains('nav-hidden'), 'Nav should hide');
        assert.ok(!ulElement.classList.contains('open'), 'Menu should close on scroll');
        assert.strictEqual(global.document.body.style.overflow, ''); // Overflow should be restored
    });
});
