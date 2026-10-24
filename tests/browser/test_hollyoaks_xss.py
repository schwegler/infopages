"""Exercise actual history renderers with hostile JSON, including nested families."""
import json
from pathlib import Path

import pytest
from playwright.sync_api import expect


@pytest.mark.parametrize('legacy', [False, True], ids=['current-page', 'legacy-script'])
def test_hollyoaks_xss_prevention(page, site_url, legacy):
    payload = '<img src=x onerror="window.xss_vulnerable=true">'
    data = json.loads((Path(__file__).resolve().parents[2] / 'hollyoaks_data.json').read_text())
    character_id = 'person\" data-injected=\"true'
    character_name = 'Character ' + payload
    data['characters'] = {character_id: {'name': character_name, 'summary': 'Summary ' + payload}}
    data['familyStructures'] = {'hostile\" data-injected=\"true': {
        'name': 'Family ' + payload,
        'tree': [{'id': character_id, 'note': 'Note ' + payload, 'children': [
            {'id': 'unknown', 'name': 'Nested ' + payload}
        ]}],
    }}
    data['timelineEvents'] = [{'year': 1996, 'title': character_name + ' Event',
                               'description': 'Description ' + payload, 'family': 'cunningham'}]
    page.route('**/hollyoaks_data.json', lambda route: route.fulfill(json=data))
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    if legacy:
        # Load the real repository script over HTTP and let its fetch initialize it.
        # No CSP here: the DOM assertions must protect us without a policy backstop.
        page.route('**/__legacy_hollyoaks.html', lambda route: route.fulfill(
            content_type='text/html', body='''<!doctype html><html><body>
            <select id="year-select"></select><div id="all-family-trees"></div>
            <div id="timeline-content"></div><div id="character-modal">
            <button id="close-modal">Close</button><div id="modal-content"></div></div>
            <div id="timeline-section"></div><script src="/hollyoaks.js"></script>
            </body></html>'''))
        page.goto(site_url + '/__legacy_hollyoaks.html')
        family = page.locator('#all-family-trees')
        timeline = page.locator('#timeline-content')
        button = family.locator('button.character-node').first
        modal = page.locator('#modal-content')
    else:
        page.goto(site_url + '/hollyoaks_history.html')
        expect(page.locator('#timeline-count')).to_have_text('1 events shown')
        page.locator('[data-history-view="history-families"]').click()
        family = page.locator('#families')
        family.locator('summary').click()
        timeline = page.locator('#timeline')
        button = family.locator('button[data-person]')
        modal = page.locator('[data-dialog-content]')
    expect(family).to_contain_text('Family ' + payload)
    expect(family).to_contain_text('Note ' + payload)
    expect(family).to_contain_text('Nested ' + payload)
    expect(timeline).to_contain_text(character_name + ' Event')
    expect(timeline).to_contain_text('Description ' + payload)
    expect(button).to_have_text(character_name + (' (Note ' + payload + ')' if legacy else ''))
    button.click()
    expect(modal).to_contain_text(character_name)
    expect(modal).to_contain_text('Summary ' + payload)
    if legacy:
        expect(modal).to_contain_text(character_name + ' Event')
    else:
        expect(modal).to_contain_text('Description ' + payload)
    for rendered in (family, timeline, modal):
        expect(rendered.locator('img, script, [onerror], [data-injected]')).to_have_count(0)
    assert page.evaluate('window.xss_vulnerable !== true')
    assert not errors, errors
