import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getCharacterDetails } from '../hollyoaks.js';

describe('getCharacterDetails', () => {
    const mockData = {
        characters: {
            'tony': { name: 'Tony Hutchinson', summary: 'The original.' },
            'cindy': { name: 'Cindy Cunningham', summary: 'A survivor.' }
        },
        timelineEvents: [
            { year: 1999, title: 'Tony buys the Hutch', description: 'Tony Hutchinson opens a restaurant.' },
            { year: 1996, title: 'Cindy arrives', description: 'Cindy Cunningham arrives in the village.' },
            { year: 2010, title: 'Tony gets married', description: 'Tony Hutchinson ties the knot.' },
            { year: 2005, title: 'Bomb explosion', description: 'A bomb goes off.' } // Not relevant to either
        ]
    };

    test('returns correct character and sorted events for valid ID', () => {
        const result = getCharacterDetails('tony', mockData);

        assert.ok(result);
        assert.strictEqual(result.character.name, 'Tony Hutchinson');
        assert.strictEqual(result.events.length, 2);

        // Check sorting (1999 then 2010)
        assert.strictEqual(result.events[0].year, 1999);
        assert.strictEqual(result.events[1].year, 2010);
        assert.strictEqual(result.events[0].title, 'Tony buys the Hutch');
    });

    test('returns correct character with single event', () => {
        const result = getCharacterDetails('cindy', mockData);
        assert.ok(result);
        assert.strictEqual(result.character.name, 'Cindy Cunningham');
        assert.strictEqual(result.events.length, 1);
        assert.strictEqual(result.events[0].year, 1996);
    });

    test('returns null for non-existent character ID', () => {
        const result = getCharacterDetails('unknown', mockData);
        assert.strictEqual(result, null);
    });

    test('returns empty events list if no events match', () => {
        const dataNoEvents = {
            characters: { 'newbie': { name: 'Newbie', summary: 'Just arrived.' } },
            timelineEvents: mockData.timelineEvents
        };

        const result = getCharacterDetails('newbie', dataNoEvents);
        assert.ok(result);
        assert.strictEqual(result.character.name, 'Newbie');
        assert.strictEqual(result.events.length, 0);
    });
});
