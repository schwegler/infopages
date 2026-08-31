import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

// Mock DOM before import
global.window = {
    addEventListener: () => {},
    _elements: {},
    innerHeight: 768,
    pageYOffset: 0,
};

global.document = {
    addEventListener: () => {},
    _elements: {},
    getElementById: function(id) {
        if (!this._elements[id]) {
            this._elements[id] = {
                id: id,
                innerHTML: '',
                style: {},
                classList: { toggle: () => {}, remove: () => {}, add: () => {}, contains: () => {} },
                addEventListener: () => {},
                appendChild: () => {},
                children: [],
                getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100 })
            };
        }
        return this._elements[id];
    },
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, setAttribute: () => {}, className: '' }),
    createElementNS: () => ({ setAttribute: () => {}, classList: { add: () => {} }, style: {} }),
    body: {
        style: { setProperty: () => {} },
        offsetHeight: 1000
    }
};

const { createDeaChart } = await import('../sqlmovebuffy.js');

describe('sqlmovebuffy.js - createDeaChart', () => {
    beforeEach(() => {
        global.document._elements = {};
    });

    test('generates correct HTML with full mock data', () => {
        const mockData = {
            'Improved': { count: 953, percent: 76, color: 'green' },
            'Degraded': { count: 12, percent: 1, color: 'yellow' },
            'Insight': {text: 'Cleveland is overwhelmingly faster. New magic is potent!'}
        };

        createDeaChart('test-container', mockData);

        const el = global.document.getElementById('test-container');
        const html = el.innerHTML;

        assert.ok(html.includes('Improved'));
        assert.ok(html.includes('Degraded'));

        // Progress bars checks
        assert.ok(html.includes('bg-green-500'));
        assert.ok(html.includes('style="width: 76%"'));
        assert.ok(html.includes('title="953"'));

        assert.ok(html.includes('bg-yellow-500'));
        assert.ok(html.includes('style="width: 1%"'));
        assert.ok(html.includes('title="12"'));

        // Insight check
        assert.ok(html.includes('Cleveland is overwhelmingly faster. New magic is potent!'));

        // Ensure Insight isn't rendered as a progress bar
        assert.ok(!html.includes('bg-undefined-500'));
        assert.ok(!html.includes('<span class="w-1/3 text-gray-400">Insight</span>'));
    });

    test('handles data gracefully when Insight is missing', () => {
        const mockData = {
            'Stable': { count: 1222, percent: 97.5, color: 'blue' }
        };

        createDeaChart('test-container-2', mockData);

        const el = global.document.getElementById('test-container-2');
        const html = el.innerHTML;

        assert.ok(html.includes('Stable'));
        assert.ok(html.includes('bg-blue-500'));
        assert.ok(html.includes('style="width: 97.5%"'));
        assert.ok(html.includes('title="1222"'));

        // Since there is no insight text, it should render an empty sub-heading paragraph
        assert.ok(html.includes('<p class="text-center mt-4 sub-heading"></p>'));
    });

    test('handles empty data gracefully', () => {
        const mockData = {};

        createDeaChart('test-container-empty', mockData);

        const el = global.document.getElementById('test-container-empty');
        const html = el.innerHTML;

        // Should contain the space-y-3 div but no flex items
        assert.ok(html.includes('<div class="space-y-3">'));
        assert.ok(!html.includes('<div class="flex items-center">'));

        // Empty Insight text
        assert.ok(html.includes('<p class="text-center mt-4 sub-heading"></p>'));
    });
});
