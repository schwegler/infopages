import { test, describe } from 'node:test';
import assert from 'node:assert';

// Mock browser globals before importing the module
global.document = {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
};
global.window = {};
global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
};

// Use dynamic import to ensure globals are set before the module executes
// Using top-level await requires .mjs or "type": "module" in package.json (which we have)
const { buildFamilyTreeHTML } = await import('../hollyoaks.js');

describe('buildFamilyTreeHTML', () => {
    test('should return empty string for empty nodes', () => {
        assert.strictEqual(buildFamilyTreeHTML([], {}), '');
        assert.strictEqual(buildFamilyTreeHTML(null, {}), '');
        assert.strictEqual(buildFamilyTreeHTML(undefined, {}), '');
    });

    test('should return HTML for single node', () => {
        const nodes = [{ id: 'char1', name: 'Char1' }];
        const characters = { char1: { name: 'Character 1' } };
        const html = buildFamilyTreeHTML(nodes, characters);
        assert.ok(html.includes('Character 1'));
        assert.ok(html.includes('data-id="char1"'));
        assert.ok(html.startsWith('<ul>'));
        assert.ok(html.endsWith('</ul>'));
    });

    test('should handle missing character data gracefully', () => {
        const nodes = [{ id: 'char1', name: 'Fallback Name' }];
        const characters = {};
        const html = buildFamilyTreeHTML(nodes, characters);
        assert.ok(html.includes('Fallback Name'));
    });

    test('should render recursive structure', () => {
        const nodes = [
            {
                id: 'parent',
                children: [
                    { id: 'child' }
                ]
            }
        ];
        const characters = {
            parent: { name: 'Parent' },
            child: { name: 'Child' }
        };
        const html = buildFamilyTreeHTML(nodes, characters);
        // Should contain both names
        assert.ok(html.includes('Parent'));
        assert.ok(html.includes('Child'));

        // Should have nested ULs. The parent has a UL, and the child (inside recursive call) has a UL.
        // Total 2 <ul> opening tags.
        const countUl = (html.match(/<ul/g) || []).length;
        assert.strictEqual(countUl, 2);
    });

    test('should render note if present', () => {
        const nodes = [{ id: 'char1', note: 'some note' }];
        const characters = { char1: { name: 'Character 1' } };
        const html = buildFamilyTreeHTML(nodes, characters);
        assert.ok(html.includes('(some note)'));
        assert.ok(html.includes('<em'));
    });
});
