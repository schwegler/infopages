import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { createScrollObserver } from '../src/utils.js';

// Mock DOM environments
global.document = {
    querySelectorAll: mock.fn(() => []),
};

global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = [];
    }
    observe(el) {
        this.observed.push(el);
    }
    unobserve(el) {
        const idx = this.observed.indexOf(el);
        if (idx > -1) this.observed.splice(idx, 1);
    }
};

describe('createScrollObserver', () => {
    beforeEach(() => {
        // Reset mocks
        global.document.querySelectorAll.mock.resetCalls();
        global.document.querySelectorAll.mock.mockImplementation(() => []);
    });

    test('initializes with default options', () => {
        const observer = createScrollObserver();
        assert.ok(observer instanceof IntersectionObserver);
        assert.strictEqual(observer.options.threshold, 0.1);
        assert.strictEqual(observer.options.rootMargin, '0px');
    });

    test('initializes with custom options', () => {
        const observer = createScrollObserver({
            threshold: 0.5,
            rootMargin: '10px'
        });
        assert.strictEqual(observer.options.threshold, 0.5);
        assert.strictEqual(observer.options.rootMargin, '10px');
    });

    test('observes elements matching selector', () => {
        const elements = [{ id: 1 }, { id: 2 }];
        global.document.querySelectorAll.mock.mockImplementation((sel) => {
            if (sel === '.test') return elements;
            return [];
        });

        const observer = createScrollObserver({ selector: '.test' });
        assert.strictEqual(observer.observed.length, 2);
        assert.deepStrictEqual(observer.observed, elements);
    });

    test('adds active class on intersection', () => {
        const el = { classList: { add: mock.fn() } };
        const observer = createScrollObserver();

        // Simulate intersection
        const entry = { isIntersecting: true, target: el };
        observer.callback([entry], observer);

        assert.strictEqual(el.classList.add.mock.calls.length, 1);
        assert.strictEqual(el.classList.add.mock.calls[0].arguments[0], 'active');
    });

    test('unobserves if unobserve: true', () => {
        const el = { classList: { add: mock.fn() } };
        const observer = createScrollObserver({ unobserve: true });

        // Spy on unobserve
        const unobserveSpy = mock.fn();
        observer.unobserve = unobserveSpy;

        const entry = { isIntersecting: true, target: el };
        observer.callback([entry], observer);

        assert.strictEqual(unobserveSpy.mock.calls.length, 1);
        assert.strictEqual(unobserveSpy.mock.calls[0].arguments[0], el);
    });

    test('does NOT unobserve if unobserve: false', () => {
        const el = { classList: { add: mock.fn() } };
        const observer = createScrollObserver({ unobserve: false });

        const unobserveSpy = mock.fn();
        observer.unobserve = unobserveSpy;

        const entry = { isIntersecting: true, target: el };
        observer.callback([entry], observer);

        assert.strictEqual(unobserveSpy.mock.calls.length, 0);
    });
});
