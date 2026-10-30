"""Editor/export contracts use explicit synthetic test layers, never mascot substitutes."""
import base64
import json
import struct
import zlib
from pathlib import Path
from playwright.sync_api import expect

ROOT = Path(__file__).resolve().parents[2]


def test_internal_art_gate_and_responsive_layout(clean_page, site_url):
    page = clean_page
    manifest = json.loads((ROOT/'assets/dress-up/manifest.json').read_text())
    manifest['reviewed'] = False
    page.route('**/assets/dress-up/manifest.json', lambda route: route.fulfill(json=manifest))
    page.goto(site_url + '/dress-up')
    expect(page.get_by_role('status')).to_contain_text('Internal preview')
    for name in ['Telly', 'Facet', 'Hitch', 'Andrew']:
        page.locator('.character-choice').filter(has_text=name).click()
        expect(page.locator('#character-name')).to_have_text(name)
        expect(page.get_by_role('button', name='Download PNG')).to_be_disabled()
        expect(page.locator('#reference')).to_have_attribute('alt', f'{name}: approved full-figure reference, not a layered outfit preview')
    for width in [320, 390, 680, 900, 1470]:
        page.set_viewport_size({'width': width, 'height': 1074})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.get_by_label('Zoom', exact=True).select_option('0.75')
    expect(page.locator('#preview')).to_have_class('preview checkerboard zoom-small')
    page.get_by_label('Checkerboard', exact=True).uncheck()
    expect(page.locator('#preview')).not_to_have_class('checkerboard')
    page.emulate_media(color_scheme='dark')
    expect(page.locator('.signature-light')).to_be_hidden()
    expect(page.locator('.signature-dark')).to_be_visible()


def png_fixture(color, rect, size=1024):
    """Simple deterministic test data, not illustration or deliverable artwork."""
    def chunk(kind, data):
        return struct.pack('>I',len(data)) + kind + data + struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    rows=[]
    x0,y0,x1,y1=rect
    for y in range(size):
        rows.append(b'\0'+b''.join(bytes(color if x0<=x<x1 and y0<=y<y1 else (0,0,0,0)) for x in range(size)))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(rows)))+chunk(b'IEND',b'')


def test_all_characters_real_png_export_and_reset(clean_page, site_url, tmp_path):
    page=clean_page
    manifest=json.loads((ROOT/'assets/dress-up/manifest.json').read_text())
    manifest['reviewed']=True  # Test-only override, never written to the production manifest.
    for character in manifest['characters']:
        character.pop('attachmentRegion', None)
        character['groups'] = [
            {'id':'outfit','label':'Outfit','default':'everyday','options':[{'id':'everyday','label':'Everyday','layers':[]},{'id':'alternate','label':'Alternate','layers':[]}]},
            {'id':'accessory','label':'Accessory','default':'none','options':[{'id':'none','label':'None','layers':[]},{'id':'prop','label':'Prop','layers':[]}]}
        ]
        def layer(name,role,order):
            return {'src':f'assets/dress-up/fixtures/{name}.png','role':role,'order':order,'pose':character['pose']}
        character['sourceCanvas']={'width':1254,'height':1254}
        anchors={key:[500+i,600+i] for i,key in enumerate(['head','torso','hip','foot-left','foot-right','shoulder-left','shoulder-right','wrist-left','wrist-right'])}
        character['base']=[]
        character['bodyStates']={'default':'open','anchors':anchors,'states':[
            {'id':'open','completeBody':True,'anchors':anchors.copy(),'layers':[layer('body','body',20)]},
            {'id':'grip','completeBody':True,'anchors':anchors.copy(),'layers':[layer('grip-body','body',20)]}
        ]}
        character['groups'][1]['options'][1]['bodyState']='grip'
        for group in character['groups']:
            for index,option in enumerate(group['options']):
                option['layers']=[] if index==0 else [layer('outfit','outfit',30)]
    page.route('**/assets/dress-up/manifest.json',lambda route:route.fulfill(json=manifest))
    body=png_fixture((222,12,16,255),(245,122,1009,1132),1254)
    outfit=png_fixture((12,34,222,255),(367,490,887,980),1254)
    grip_body=png_fixture((22,200,16,255),(367,122,887,1132),1254)
    page.route('**/assets/dress-up/fixtures/body.png',lambda route:route.fulfill(body=body,content_type='image/png'))
    page.route('**/assets/dress-up/fixtures/grip-body.png',lambda route:route.fulfill(body=grip_body,content_type='image/png'))
    page.route('**/assets/dress-up/fixtures/outfit.png',lambda route:route.fulfill(body=outfit,content_type='image/png'))
    page.goto(site_url+'/dress-up')
    for name in ['Telly','Facet','Hitch','Andrew']:
        page.locator('.character-choice').filter(has_text=name).click()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
        page.get_by_role('radio',name='Alternate',exact=True).check()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
        page.get_by_label('Zoom',exact=True).select_option('1.25')
        page.get_by_label('Checkerboard',exact=True).uncheck()
        with page.expect_download() as download_info:
            page.get_by_role('button',name='Download PNG').click()
        download=download_info.value
        assert download.suggested_filename.startswith(f'schweg-{name.lower()}-alternate-')
        assert download.suggested_filename.endswith('.png')
        target=tmp_path/download.suggested_filename;download.save_as(target)
        data=target.read_bytes()
        assert data[:8]==b'\x89PNG\r\n\x1a\n'
        assert struct.unpack('>II',data[16:24])==(1024,1024)
        values=page.evaluate('''async (data) => {
            const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
            const bitmap=await createImageBitmap(image);
            const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
            const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);
            return [[0,0],[512,200],[512,512],[1023,1023]].map(([x,y])=>Array.from(ctx.getImageData(x,y,1,1).data));
        }''',base64.b64encode(data).decode())
        assert values==[[0,0,0,0],[222,12,16,255],[12,34,222,255],[0,0,0,0]]
        # A prop switches the complete body, without stacking the old one or changing the outfit.
        page.locator('input[name="accessory"]').last.check()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
        with page.expect_download() as grip_info:
            page.get_by_role('button',name='Download PNG').click()
        grip_path=tmp_path/('grip-'+name+'.png');grip_info.value.save_as(grip_path)
        grip_values=page.evaluate('''async (data) => {
            const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
            const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
            const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
            return [[250,200],[512,200],[512,512]].map(([x,y])=>Array.from(ctx.getImageData(x,y,1,1).data));
        }''',base64.b64encode(grip_path.read_bytes()).decode())
        assert grip_values==[[0,0,0,0],[22,200,16,255],[12,34,222,255]]
        page.get_by_role('button',name=f'Reset {name}').click()
        expect(page.get_by_role('radio',name='Everyday',exact=True)).to_be_checked()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()


def test_atomic_part_replaces_hand_without_moving_canonical_pixels(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/dress-up')
    manifest = json.loads((ROOT/'assets/dress-up/manifest.json').read_text())
    character = manifest['characters'][0]
    character['sourceCanvas'] = {'width': 1024, 'height': 1024}
    def layer(name, role, order):
        return {'src': f'assets/dress-up/fixtures/{name}.png', 'role': role, 'order': order, 'pose': character['pose']}
    character['base'] = [layer('open', 'body', 20)]
    character['attachmentRegion'] = {'id': 'hand', 'pose': character['pose'], 'rect': [600, 500, 900, 800]}
    character['groups'] = [{'id': 'accessory', 'label': 'Accessory', 'default': 'none', 'options': [
        {'id': 'none', 'label': 'None', 'layers': []},
        {'id': 'prop', 'label': 'Prop', 'layers': [], 'attachmentBundle': {
            'id': 'grasp', 'region': 'hand', 'body': layer('grip', 'body', 20),
            'parts': [layer('prop', 'accessory', 40)]}}
    ]}]
    manifest['characters'] = [character]
    for name, color, rect in [('open', (222, 12, 16, 255), (100, 100, 800, 750)),
                              ('grip', (22, 200, 16, 255), (650, 550, 750, 650)),
                              ('prop', (12, 34, 222, 255), (740, 600, 850, 700))]:
        data = png_fixture(color, rect)
        def fulfill_image(data):
            return lambda route: route.fulfill(body=data, content_type='image/png')
        page.route(f'**/fixtures/{name}.png', fulfill_image(data))
    result = page.evaluate('''async manifest => {
      const {renderSelection}=await import('/assets/dress-up/render.js');
      const sample=canvas=>[[150,150],[620,520],[680,580],[800,650],[950,950]].map(([x,y])=>Array.from(canvas.getContext('2d').getImageData(x,y,1,1).data));
      const out=[];
      for (const accessory of ['none','prop','none','prop']) {
        const {canvas}=await renderSelection(manifest,{character:manifest.characters[0].id,options:{accessory}});
        out.push(sample(canvas));
      }
      return out;
    }''', manifest)
    assert result[0] == result[2]
    assert result[1] == result[3]
    assert result[1] == [[222,12,16,255], [0,0,0,0], [22,200,16,255], [12,34,222,255], [0,0,0,0]]
    # One integrated source supplies both anatomical ownership and linked front depth.
    option = character['groups'][0]['options'][1]
    option['attachmentBundle'] = {
        'id': 'integrated-grasp', 'region': 'hand',
        'integrated': layer('grip', 'accessory', 20),
        'frontPolygon': [[710,560],[740,560],[740,640],[710,640]],
    }
    character['attachmentRegion']['polygon'] = [[600,500],[900,500],[900,800],[600,800]]
    character['groups'].append({'id':'outfit','label':'Outfit','default':'normal','options':[
        {'id':'normal','label':'Normal','layers':[layer('sleeve','outfit',30)]}]})
    sleeve = png_fixture((12,34,222,255),(700,550,800,700))
    page.route('**/fixtures/sleeve.png', lambda route: route.fulfill(body=sleeve,content_type='image/png'))
    integrated = page.evaluate('''async manifest=>{
      const {renderSelection}=await import('/assets/dress-up/render.js');
      const {canvas}=await renderSelection(manifest,{character:manifest.characters[0].id,options:{accessory:'prop',outfit:'normal'}});
      return [[150,150],[620,520],[680,580],[705,600],[720,600],[780,600]].map(([x,y])=>Array.from(canvas.getContext('2d').getImageData(x,y,1,1).data));
    }''',manifest)
    assert integrated == [[222,12,16,255],[0,0,0,0],[22,200,16,255],[12,34,222,255],[22,200,16,255],[12,34,222,255]]


def test_reviewed_factory_real_assets_keyboard_and_download(clean_page, site_url, tmp_path):
    page = clean_page
    manifest = json.loads((ROOT/'assets/dress-up/manifest.json').read_text())
    assert manifest['reviewed'] is True
    page.goto(site_url+'/dress-up')
    expect(page.get_by_role('heading',name='Sticker factory',exact=True)).to_be_visible()
    expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
    expect(page.locator('input[name="character"][value="telly"]')).to_be_checked()
    # Native radio keyboard interaction must update the actual studio.
    page.locator('input[name="character"][value="telly"]').focus()
    page.keyboard.press('ArrowRight')
    expect(page.locator('#character-name')).to_have_text('Facet')
    for character in manifest['characters']:
        page.locator('.character-choice').filter(has_text=character['label']).click()
        for group in character['groups']:
            expect(page.get_by_role('group',name=group['label'],exact=True)).to_be_visible()
            page.locator(f'input[name="{group["id"]}"][value="{group["options"][-1]["id"]}"]').check()
        accessory=next(g for g in character['groups']if g['id']=='accessory')
        for value in ['none',accessory['options'][-1]['id'],'none',accessory['options'][-1]['id']]:
            page.locator(f'input[name="accessory"][value="{value}"]').check()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
        with page.expect_download() as info:
            page.get_by_role('button',name='Download PNG').click()
        download=info.value;assert download.suggested_filename.startswith('schweg-'+character['id']+'-')
        path=tmp_path/download.suggested_filename;download.save_as(path);data=path.read_bytes()
        assert struct.unpack('>II',data[16:24])==(1024,1024)
        alpha=page.evaluate('''async encoded=>{
          const image=new Image();image.src='data:image/png;base64,'+encoded;await image.decode();
          const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          const p=ctx.getImageData(0,0,1024,1024).data;let edge=0,zero=0,solid=0;
          for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){const a=p[(y*1024+x)*4+3];if(!x||!y||x===1023||y===1023)edge=Math.max(edge,a);if(!a)zero++;if(a===255)solid++;}
          return {edge,zero,solid};
        }''',base64.b64encode(data).decode())
        assert alpha['edge']==0 and alpha['zero']>0 and alpha['solid']>0
        page.get_by_label('Zoom',exact=True).select_option('1.25')
        page.get_by_label('Checkerboard',exact=True).uncheck()
        with page.expect_download() as second:
            page.get_by_role('button',name='Download PNG').click()
        second_path=tmp_path/('second-'+download.suggested_filename);second.value.save_as(second_path)
        assert second_path.read_bytes()==data
        page.get_by_role('button',name='Reset '+character['label']).click()
        for group in character['groups']:
            expect(page.locator(f'input[name="{group["id"]}"][value="{group["default"]}"]')).to_be_checked()
        expect(page.get_by_role('button',name='Download PNG')).to_be_enabled()
    for scheme in ['light','dark']:
        page.emulate_media(color_scheme=scheme)
        for width in [320,390,680,900,1470]:
            page.set_viewport_size({'width':width,'height':900})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
