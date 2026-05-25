import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { createRevealObserver } from '../animations.js';

describe('animations.js - createRevealObserver', () => {
    let callback;
    let observerInstance;

    beforeEach(() => {
        // Mock IntersectionObserver
        global.IntersectionObserver = class IntersectionObserver {
            constructor(cb, options) {
                callback = cb;
                this.options = options;
                this.observe = mock.fn();
                this.unobserve = mock.fn();
                this.disconnect = mock.fn();
                observerInstance = this;
            }
        };
    });

    test('adds activeClass when intersecting', () => {
        const observer = createRevealObserver({ activeClass: 'test-visible' });
        const target = {
            classList: {
                add: mock.fn()
            }
        };
        const entries = [{
            isIntersecting: true,
            target: target
        }];

        callback(entries);

        assert.strictEqual(target.classList.add.mock.callCount(), 1);
        assert.strictEqual(target.classList.add.mock.calls[0].arguments[0], 'test-visible');
    });

    test('triggers onIntersect callback', () => {
        const onIntersect = mock.fn();
        createRevealObserver({ onIntersect });
        const target = { classList: { add: () => {} } };
        const entries = [{
            isIntersecting: true,
            target: target
        }];

        callback(entries);

        assert.strictEqual(onIntersect.mock.callCount(), 1);
        assert.strictEqual(onIntersect.mock.calls[0].arguments[0], entries[0]);
    });

    test('unobserves after intersection by default', () => {
        const observer = createRevealObserver();
        const target = { classList: { add: () => {} } };
        const entries = [{
            isIntersecting: true,
            target: target
        }];

        callback(entries);

        assert.strictEqual(observerInstance.unobserve.mock.callCount(), 1);
        assert.strictEqual(observerInstance.unobserve.mock.calls[0].arguments[0], target);
    });

    test('does not unobserve when unobserve is false', () => {
        const observer = createRevealObserver({ unobserve: false });
        const target = { classList: { add: () => {} } };
        const entries = [{
            isIntersecting: true,
            target: target
        }];

        callback(entries);

        assert.strictEqual(observerInstance.unobserve.mock.callCount(), 0);
    });

    test('uses default options', () => {
        createRevealObserver();
        assert.strictEqual(observerInstance.options.threshold, 0.1);

        const target = {
            classList: {
                add: mock.fn()
            }
        };
        callback([{ isIntersecting: true, target }]);
        assert.strictEqual(target.classList.add.mock.calls[0].arguments[0], 'is-visible');
    });

    test('handles activeClass: null', () => {
        createRevealObserver({ activeClass: null });
        const target = {
            classList: {
                add: mock.fn()
            }
        };
        callback([{ isIntersecting: true, target }]);
        assert.strictEqual(target.classList.add.mock.callCount(), 0);
    });

    test('does nothing when not intersecting', () => {
        const onIntersect = mock.fn();
        createRevealObserver({ onIntersect });
        const target = {
            classList: {
                add: mock.fn()
            }
        };
        const entries = [{
            isIntersecting: false,
            target: target
        }];

        callback(entries);

        assert.strictEqual(target.classList.add.mock.callCount(), 0);
        assert.strictEqual(onIntersect.mock.callCount(), 0);
        assert.strictEqual(observerInstance.unobserve.mock.callCount(), 0);
    });
});
