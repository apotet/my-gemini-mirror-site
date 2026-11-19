#!/usr/bin/env node
// Regression of the REAL Quiz photo viewer, not an isolated CSS snapshot.
// Network images are replaced with deterministic portrait/landscape fixtures;
// all six interactions exercise the shared ZoomableImage used by every quiz photo.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { loadBankWithExplanations } from './load-bank.mjs';

const { chromium } = await import(process.env.NETOPS_PLAYWRIGHT_MODULE || 'playwright');
const { ALL_QUESTIONS } = await loadBankWithExplanations();
const base = process.env.NETOPS_BASE_URL || 'http://127.0.0.1:5428/my-gemini-mirror-site/';
const output = 'scripts/.cache/review-browser';
mkdirSync(output, { recursive: true });

const cases = [
  { id: 'l1v2-a-poe-limit', type: 'portrait', imageWidth: 480, imageHeight: 1000, panAxis: 'y' },
  { id: 'l1v2-c-otdr-pulse', type: 'landscape', imageWidth: 1600, imageHeight: 480, panAxis: 'x' },
];
const browser = await chromium.launch({
  ...(process.env.NETOPS_CHROMIUM_PATH ? { executablePath: process.env.NETOPS_CHROMIUM_PATH } : {}),
});
const safeRect = async (image, surface) => {
  const i = await image.boundingBox();
  const c = await surface.boundingBox();
  assert.ok(i && c, 'viewer and image boxes are measurable');
  return { i, c };
};
const within = ({i, c}, context) => {
  assert.ok(i.x >= c.x - 2 && i.y >= c.y - 2 &&
    i.x + i.width <= c.x + c.width + 2 &&
    i.y + i.height <= c.y + c.height + 2,
    context + ': image is fully visible with no cropped edges');
};
const routeImage = (width, height) =>
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
  '<rect width="100%" height="100%" fill="#dddddd"/>' +
  '<rect x="5" y="5" width="' + (width - 10) + '" height="' + (height - 10) + '" fill="none" stroke="#333333" stroke-width="8"/>' +
  '<text x="30" y="65" font-size="42" fill="#000000">Фото теста</text></svg>';

try {
  for (const width of [375, 1440]) {
    const mobile = width === 375;
    for (const photo of cases) {
      const q = ALL_QUESTIONS.find(item => item.id === photo.id);
      assert.ok(q && q.image, photo.id + ': real photo question exists');
      const page = await browser.newPage({
        viewport: {width, height: 900}, isMobile: mobile, hasTouch: mobile,
        ignoreHTTPSErrors: process.env.NETOPS_IGNORE_HTTPS_ERRORS === '1',
      });
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      // Real quiz + real question/answer ID; only source image bytes are deterministic
      // to verify the generic component with both tall and wide aspect ratios.
      await page.route('**/assets/photos/**', route => route.fulfill({
        status: 200, contentType: 'image/svg+xml',
        body: routeImage(photo.imageWidth, photo.imageHeight),
      }));
      const fixture = {
        questions: [q], mode: 'mixed', feedbackMode: 'instant', currentIndex: 0,
        isCompleted: false, startTime: Date.now() - 3000,
        attemptId: 'zoom-' + photo.type, submittedQuestions: {}, userAnswers: {},
        difficulty: 'beginner', requestedCount: 1,
      };
      await page.addInitScript(session => {
        localStorage.setItem('osi_active_session', JSON.stringify(session));
      }, fixture);
      try {
        await page.goto(base);
        await page.getByRole('button', {name: mobile ? 'Тесты' : 'Тестирование', exact: true}).click();
        await page.getByRole('button', {name:'Продолжить тестирование',exact:true}).click();
        await page.getByText(q.text, {exact:true}).waitFor();
        const oldSession = await page.evaluate(() => localStorage.getItem('osi_active_session'));
        await page.getByRole('button', {name: /^Открыть .* на весь экран$/}).click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        const image = dialog.locator('[data-photo-viewer-image]');
        const surface = dialog.locator('[data-photo-viewer-pan]');
        await page.waitForFunction(() => {
          const img = document.querySelector('[data-photo-viewer-image]');
          return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
        });
        assert.equal(await dialog.locator('img').count(), 1, 'one image in modal');
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'modal locks background scroll');
        const original = await safeRect(image, surface);
        within(original, photo.type + ' ' + width + ' at 100%');
        assert.equal(await dialog.getByText('100%', {exact:true}).count() > 0, true);

        for (const fraction of [0.75, 0.5, 1]) {
          const label = 'Масштаб ' + Math.round(fraction * 100) + '%';
          await dialog.getByRole('button', {name:label,exact:true}).click();
          const selected = dialog.getByRole('button', {name:label,exact:true});
          assert.equal(await selected.getAttribute('aria-pressed'), 'true', label + ' is selectable');
          const next = await safeRect(image, surface);
          within(next, photo.type + ' ' + width + ' at ' + fraction * 100 + '%');
          assert.ok(Math.abs(next.i.width - original.i.width * fraction) <= 3,
            photo.type + ' ' + width + ': expected fractional image width at ' + fraction);
        }

        // Wheel zoom goes below and above 100% without automatically resetting.
        const center = await surface.boundingBox();
        await page.mouse.move(center.x + center.width / 2, center.y + center.height / 2);
        await page.mouse.wheel(0, 300);
        const wheelOut = await safeRect(image, surface);
        assert.ok(wheelOut.i.width < original.i.width, 'wheel can zoom out below 100%');
        await dialog.getByRole('button', {name:'Масштаб 100%',exact:true}).click();

        // Double click zooms far enough for overflow and two-axis panning on a tall image.
        await page.mouse.dblclick(center.x + center.width / 2, center.y + center.height / 2);
        let zoomed = await safeRect(image, surface);
        assert.ok(zoomed.i.width > original.i.width * 2, 'double click zooms to 250%');

        const before = await image.boundingBox();
        if (!mobile) {
          const sx = center.x + center.width / 2, sy = center.y + center.height / 2;
          await page.mouse.move(sx, sy);
          await page.mouse.down();
          await page.mouse.move(sx + 100, sy + 100, {steps:10});
          await page.mouse.up();
        } else {
          const cdp = await page.context().newCDPSession(page);
          const sx = center.x + center.width / 2, sy = center.y + center.height / 2;
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchStart', touchPoints: [{x:sx, y:sy, id:1}],
          });
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove', touchPoints: [{x:sx + 100, y:sy + 100, id:1}],
          });
          await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
        }
        const after = await image.boundingBox();
        const distance = photo.panAxis === 'y' ? Math.abs(after.y - before.y) : Math.abs(after.x - before.x);
        assert.ok(distance > 20, photo.type + ' ' + width + ': drag actually pans ' + photo.panAxis + ' axis, moved=' + distance);

        // 100% restores the whole image after panning; 50% persists without snapping.
        await dialog.getByRole('button', {name:'Масштаб 50%',exact:true}).click();
        await page.waitForTimeout(80);
        within(await safeRect(image,surface), photo.type + ' at persistent 50%');
        await dialog.getByRole('button', {name:'Масштаб 100%',exact:true}).click();
        within(await safeRect(image,surface), photo.type + ' at fitted 100% after drag');
        await page.screenshot({path:output + '/photo-viewer-' + photo.type + '-' + width + '.png'});

        if (mobile) {
          // Real two-finger gesture must change scale, not invoke document scroll.
          const cdp = await page.context().newCDPSession(page);
          const sx = center.x + center.width / 2, sy = center.y + center.height / 2;
          await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[
            {x:sx - 35,y:sy,id:1},{x:sx + 35,y:sy,id:2},
          ]});
          await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[
            {x:sx - 70,y:sy,id:1},{x:sx + 70,y:sy,id:2},
          ]});
          await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
          const pinch = await safeRect(image,surface);
          assert.ok(pinch.i.width > original.i.width * 1.3, 'pinch zoom operates on touch mobile');
        }

        await dialog.getByRole('button',{name:'Закрыть'}).click();
        assert.equal(await dialog.count(),0,'viewer closes');
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'background scroll restored');
        assert.equal(await page.evaluate(() => localStorage.getItem('osi_active_session')),oldSession,
          'zooming photos never changes questions, answers or saved attempt');
        assert.deepEqual(errors,[], 'no browser exceptions at ' + width + '/' + photo.type);
        await page.close();
      } catch(e) {
        await page.screenshot({path: output + '/photo-viewer-ERROR-' + width + '-' + photo.type + '.png'}).catch(()=>{});
        throw e;
      } finally {
        if(!page.isClosed()) await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log('PASS: portrait/landscape; 375/1440px; full fit, 50/75/100%, wheel, double-click, mouse/touch pan, pinch, session safety');
