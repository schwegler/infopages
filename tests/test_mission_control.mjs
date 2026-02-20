import { test, describe, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { MissionControl } from '../js/sqlhttp.js';

// Mock DOM environments
global.window = {
    requestAnimationFrame: (cb) => {
        return 1;
    },
    cancelAnimationFrame: () => {},
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: () => {},
};

global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
};

global.Path2D = class Path2D {
    constructor(path) {}
};

describe('MissionControl', () => {
    let canvas;
    let ctx;
    let statusElement;
    let initiateBtn;
    let missionControl;

    beforeEach(() => {
        ctx = {
            clearRect: mock.fn(),
            beginPath: mock.fn(),
            moveTo: mock.fn(),
            lineTo: mock.fn(),
            stroke: mock.fn(),
            fill: mock.fn(),
            save: mock.fn(),
            restore: mock.fn(),
            translate: mock.fn(),
            arc: mock.fn(),
            setLineDash: mock.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
        };

        canvas = {
            getContext: () => ctx,
            width: 800,
            height: 600,
            offsetWidth: 800,
            offsetHeight: 600,
        };

        statusElement = {
            textContent: '',
            style: { color: '' }
        };

        initiateBtn = {
            addEventListener: mock.fn(),
        };

        missionControl = new MissionControl(canvas, statusElement, initiateBtn);
    });

    test('initialization sets up canvas dimensions', () => {
        assert.strictEqual(missionControl.canvas.width, 800);
        assert.strictEqual(missionControl.canvas.height, 600);
        assert.ok(missionControl.pos.enterprise.y > 0);
    });

    test('drawMission calls context methods', () => {
        // Initial call from constructor
        const initialCalls = ctx.clearRect.mock.callCount();
        assert.strictEqual(initialCalls, 1);

        missionControl.drawMission();
        assert.strictEqual(ctx.clearRect.mock.callCount(), 2);
        // We expect at least lines and icons to be drawn
        assert.ok(ctx.beginPath.mock.callCount() >= 2); // 2 dashed lines
        assert.ok(ctx.fill.mock.callCount() >= 3); // 3 icons
    });

    test('startMission runs through stages', async () => {
        // Mock runAnimationStep to resolve immediately and track calls
        const steps = [];
        missionControl.runAnimationStep = async (config) => {
             steps.push(config.stage);
             if (config.startColor) config.startColor();
             if (config.endColor) config.endColor();
             return Promise.resolve();
        };

        await missionControl.startMission();

        assert.deepStrictEqual(steps, ['transmitting_html', 'processing', 'archiving_pdf']);
        assert.strictEqual(statusElement.textContent, 'STATUS: MISSION COMPLETE!');
        assert.strictEqual(missionControl.pos.archive.color, missionControl.lcarsColors.green);
    });

    test('startMission respects idle state', async () => {
        missionControl.missionState.stage = 'busy';
        let called = false;
        missionControl.runAnimationStep = async () => { called = true; };

        await missionControl.startMission();
        assert.strictEqual(called, false);
    });

    test('runAnimationStep updates status', async () => {
        // We test just the initialization part of runAnimationStep,
        // verifying it sets status and starts animation.
        // We won't test the full timing loop here to avoid flaky timing tests.

        let requestedFrame = false;
        global.window.requestAnimationFrame = () => {
            requestedFrame = true;
            return 1;
        };

        const promise = missionControl.runAnimationStep({
            stage: 'test_stage',
            duration: 100,
            statusText: 'TESTING STATUS'
        });

        assert.strictEqual(missionControl.missionState.stage, 'test_stage');
        assert.strictEqual(statusElement.textContent, 'STATUS: TESTING STATUS');
        assert.strictEqual(requestedFrame, true);

        // We don't await promise because it won't resolve unless we simulate frames
    });
});
