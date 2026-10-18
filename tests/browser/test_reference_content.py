from pathlib import Path
import json
import pytest
from playwright.sync_api import expect

ROUTES=['bsky_mutual_blocks','sqlhttp','sqlmovebuffy','hollyoaks_history','tna_history','gay_bar_closures']
MODULES={'sqlhttp':'sql-guide','sqlmovebuffy':'migration','hollyoaks_history':'history','tna_history':'research','gay_bar_closures':'research'}

@pytest.mark.parametrize('width',[390,768,1440])
@pytest.mark.parametrize('route',ROUTES)
def test_reference_sections_have_real_content_and_destinations(clean_page,site_url,route,width):
    page=clean_page;page.set_viewport_size({'width':width,'height':900})
    page.goto(f'{site_url}/{route}.html')
    if route=='hollyoaks_history':expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    page.locator('#reference > details > summary').click()
    # Every retained reference heading must have explanatory content before the next heading.
    empty=page.locator('#reference h2, #reference h3').evaluate_all('''nodes=>nodes.filter(h=>{
      let n=h.nextElementSibling;let content='';
      while(n&&!(/^H[1-6]$/.test(n.tagName)&&Number(n.tagName[1])<=Number(h.tagName[1]))){if(!/^H[1-6]$/.test(n.tagName))content+=n.textContent.trim();n=n.nextElementSibling;}
      return content.length<30;
    }).map(h=>h.textContent)''')
    assert not empty, f'Orphaned reference headings: {empty}'
    for link in page.locator('#reference a[href^="#"]').all():
        target=page.locator(link.get_attribute('href'))
        link.click();expect(target).to_be_visible()
        page.locator('#reference > details').evaluate('(el)=>el.open=true')
    if route=='sqlmovebuffy':
        expect(page.locator('.dma-finding')).to_have_count(4)
        for finding in page.locator('.dma-finding').all():
            finding.locator('summary').click();expect(finding.locator('p')).to_be_visible()
            assert len(finding.locator('p').inner_text())>90
        assert '**' not in page.locator('#reference').inner_text()
        assert '38 databases' not in page.locator('main').inner_text()
        expect(page.locator('[data-edge]')).to_have_count(3)
        for key,label in [('web','Web + SQL'),('api','API database'),('data','Data database')]:
            page.locator(f'button[data-role="{key}"]').click()
            expect(page.locator('#dependency-result')).to_contain_text(label+' connects to')
            expect(page.locator('[data-edge].selected')).to_have_count(2)
        page.locator('#compare').click()
        expect(page.locator('#comparison-charts figure')).to_have_count(2)
        expect(page.locator('#comparison-charts meter')).to_have_count(8)
        expect(page.locator('#compare-result table')).to_contain_text('1222')
        expect(page.locator('#compare-result table')).to_contain_text('953')
    if route in MODULES:expect(page.locator('#experiment-status')).not_to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    out=Path('artifacts/reference-repair');out.mkdir(parents=True,exist_ok=True)
    page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'{route}-{width}.png'),full_page=True)


@pytest.mark.parametrize('route,module',MODULES.items())
def test_experiment_module_failure_is_visible_and_static_reading_survives(clean_page,site_url,route,module):
    page=clean_page;page.route(f'**/assets/js/{module}.js',lambda request:request.abort())
    page.goto(f'{site_url}/{route}.html')
    expect(page.locator('#experiment-status')).to_have_attribute('data-state','error')
    expect(page.locator('#experiment-status')).to_contain_text('could not load or initialize')
    page.locator('#reference > details > summary').click()
    assert len(page.locator('#reference').inner_text())>400
    if route=='sqlmovebuffy':
        expect(page.locator('.dma-finding')).to_have_count(4)
        page.locator('.dma-finding summary').first.click()
        expect(page.locator('.dma-finding p').first).to_be_visible()
        expect(page.locator('.dependency-connections li')).to_have_count(3)
        expect(page.locator('#dependency-controls')).not_to_be_visible()
    if route=='tna_history':expect(page.locator('#tna-story')).to_contain_text('requires the page script')
    if route=='gay_bar_closures':expect(page.locator('#demographic')).to_contain_text('37%')


@pytest.mark.parametrize('failure',['http','invalid-json'])
def test_history_bad_data_has_truthful_retry(clean_page,site_url,failure):
    page=clean_page
    page.route('**/hollyoaks_data.json',lambda request:request.fulfill(status=503,body='Unavailable') if failure=='http' else request.fulfill(content_type='application/json',body='{not json'))
    page.goto(f'{site_url}/hollyoaks_history.html')
    expect(page.locator('#timeline-count')).to_contain_text('could not load')
    expect(page.get_by_role('button',name='Try again')).to_be_visible()
    page.unroute('**/hollyoaks_data.json');page.get_by_role('button',name='Try again').click()
    expect(page.locator('#timeline-count')).to_have_text('25 events shown')


def test_history_loading_is_explicit_before_data_arrives(clean_page,site_url):
    page=clean_page;pending=[]
    page.route('**/hollyoaks_data.json',lambda request:pending.append(request))
    page.goto(f'{site_url}/hollyoaks_history.html',wait_until='domcontentloaded')
    expect(page.locator('#timeline-count')).to_have_text('Loading the timeline…')
    expect(page.locator('#year')).to_be_disabled()
    assert len(pending)==1
    pending[0].fulfill(path=str(Path(__file__).resolve().parents[2]/'hollyoaks_data.json'))
    expect(page.locator('#timeline-count')).to_have_text('25 events shown')
