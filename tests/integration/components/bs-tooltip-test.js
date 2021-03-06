import { find, findAll, click, focus, triggerEvent } from 'ember-native-dom-helpers';
import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import { test, visibilityClass } from '../../helpers/bootstrap-test';

moduleForComponent('bs-tooltip', 'Integration | Component | bs-tooltip', {
  integration: true
});

function setupForPositioning() {
  Object.assign(find('#container').style, {
    position: 'absolute',
    bottom: 0,
    left: 0,
    textAlign: 'right',
    width: 300,
    height: 300
  });

  find('a').style.marginTop = 200;
}

function offset(el) {
  let rect = el.getBoundingClientRect();

  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  };
}

function assertPositioning(assert) {
  assert.equal(findAll('.tooltip').length, 1, 'Tooltip exists.');

  let tooltip = find('.tooltip');
  let trigger = find('#target');
  assert.ok(Math.round(offset(tooltip).top + tooltip.offsetHeight) <= Math.round(offset(trigger).top));
}

function isVisible(tt) {
  return tt && tt.classList.contains('fade') && tt.classList.contains(visibilityClass());
}

test('it shows visible tooltip', function(assert) {
  this.render(hbs`{{bs-tooltip title="Dummy" visible=true}}`);

  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');
  assert.equal(find('.tooltip .tooltip-inner').textContent.trim(), 'Dummy');
});

test('it shows visible tooltip with block content', function(assert) {
  this.render(hbs`{{#bs-tooltip visible=true}}
    BLOCK
    {{/bs-tooltip}}`);

  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');
  assert.equal(find('.tooltip .tooltip-inner').textContent.trim(), 'BLOCK');
});

test('it hides invisible tooltip', function(assert) {
  this.render(hbs`{{bs-tooltip title="Dummy"}}`);

  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

test('it shows and hides immediately when hovering [fade=false]', async function(assert) {
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false}}</div>`);

  await triggerEvent('#target', 'mouseover');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await triggerEvent('#target', 'mouseout');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

test('it shows and hides immediately when focusing [fade=false]', async function(assert) {
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false}}</div>`);

  await triggerEvent('#target', 'focus');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await triggerEvent('#target', 'blur');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

test('it shows and hides immediately when clicking [fade=false]', async function(assert) {
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false triggerEvents="click"}}</div>`);

  await click('#target');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await click('#target');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

test('it allows changing the trigger element to some arbitrary element', async function(assert) {
  this.render(hbs`<div id="target"></div><div>{{bs-tooltip title="Dummy" fade=false triggerElement="#target"}}</div>`);

  await triggerEvent('#target', 'mouseover');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await triggerEvent('#target', 'mouseout');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

test('it allows changing the trigger element to the parent view', async function(assert) {
  let dummyComponent = Ember.Component.extend({
    layout: hbs`<div>{{yield}}</div>`
  });
  this.register('component:dum-my', dummyComponent);

  this.render(hbs`{{#dum-my id="target"}}{{bs-tooltip title="Dummy" fade=false triggerElement="parentView"}}{{/dum-my}}`);

  await triggerEvent('#target', 'mouseover');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await triggerEvent('#target', 'mouseout');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

sinonTest('it calls onShow/onShown actions when showing tooltip [fade=false]', async function(assert) {
  let showAction = this.spy();
  this.on('show', showAction);
  let shownAction = this.spy();
  this.on('shown', shownAction);
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false onShow=(action "show") onShown=(action "shown")}}</div>`);
  await triggerEvent('#target', 'mouseover');
  assert.ok(showAction.calledOnce, 'show action has been called');
  assert.ok(shownAction.calledOnce, 'show action has been called');
});

sinonTest('it aborts showing if onShow action returns false', async function(assert) {
  let showAction = this.stub();
  showAction.returns(false);
  this.on('show', showAction);
  let shownAction = this.spy();
  this.on('shown', shownAction);
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false onShow=(action "show") onShown=(action "shown")}}</div>`);
  await triggerEvent('#target', 'mouseover');
  assert.ok(showAction.calledOnce, 'show action has been called');
  assert.notOk(shownAction.calledOnce, 'show action has not been called');
  assert.equal(findAll('.tooltip').length, 0, 'tooltip is not visible');
});

sinonTest('it calls onHide/onHidden actions when hiding tooltip [fade=false]', async function(assert) {
  let hideAction = this.spy();
  this.on('hide', hideAction);
  let hiddenAction = this.spy();
  this.on('hidden', hiddenAction);
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false onHide=(action "hide") onHidden=(action "hidden")}}</div>`);
  await triggerEvent('#target', 'mouseover');
  await triggerEvent('#target', 'mouseout');
  assert.ok(hideAction.calledOnce, 'hide action has been called');
  assert.ok(hiddenAction.calledOnce, 'hidden action was called');
});

sinonTest('it aborts hiding if onHide action returns false', async function(assert) {
  let hideAction = this.stub();
  hideAction.returns(false);
  this.on('hide', hideAction);
  let hiddenAction = this.spy();
  this.on('hidden', hiddenAction);
  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" fade=false onHide=(action "hide") onHidden=(action "hidden")}}</div>`);
  await triggerEvent('#target', 'mouseover');
  await triggerEvent('#target', 'mouseout');
  assert.ok(hideAction.calledOnce, 'hide action has been called');
  assert.notOk(hiddenAction.calledOnce, 'hidden action has not been called');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');
});

test('it keeps showing when leaving the mouse but is still focused [fade=false]', async function(assert) {
  this.render(hbs`<a href="#" id="target">{{bs-tooltip title="Dummy" fade=false}}</a>`);

  await focus('#target');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');

  await triggerEvent('#target', 'mouseover');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');
  await triggerEvent('#target', 'mouseout');
  assert.equal(findAll('.tooltip').length, 1, 'tooltip is visible');
});

test('Renders in wormhole if renderInPlace is not set', function(assert) {
  this.set('show', false);
  this.render(hbs`<div id="ember-bootstrap-wormhole"></div>{{#if show}}{{bs-tooltip title="Simple Tooltip" visible=true fade=false}}{{/if}}`);
  this.set('show', true);

  assert.equal(findAll('.tooltip').length, 1, 'Tooltip exists.');
  assert.equal(find('.tooltip').parentNode.getAttribute('id'), 'ember-bootstrap-wormhole');
});

test('Renders in place (no wormhole) if renderInPlace is set', function(assert) {
  this.set('show', false);
  this.render(hbs`<div id="ember-bootstrap-wormhole"></div>{{#if show}}{{bs-tooltip title="Simple Tooltip" visible=true fade=false renderInPlace=true}}{{/if}}`);
  this.set('show', true);

  assert.equal(findAll('.tooltip').length, 1, 'Tooltip exists.');
  assert.notEqual(find('.tooltip').parentNode.getAttribute('id'), 'ember-bootstrap-wormhole');
});

test('should place tooltip on top of element', async function(assert) {
  this.render(hbs`<div id="container"><p style="margin-top: 200px"><a href="#" id="target">Hover me{{bs-tooltip title="very very very very very very very long tooltip" fade=false}}</a></p></div>`);

  setupForPositioning.call(this);

  await triggerEvent('#target', 'mouseover');
  assertPositioning.call(this, assert);
});

test('should place tooltip on top of element if already visible', function(assert) {
  assert.expect(2);
  let done = assert.async();
  this.render(hbs`<div id="container"><p style="margin-top: 200px"><a href="#" id="target">Hover me{{bs-tooltip title="very very very very very very very long tooltip" fade=false visible=true}}</a></p></div>`);

  setupForPositioning.call(this);
  setTimeout(function() {
    assertPositioning.call(this, assert);
    done();
  }, 0);
});

test('should place tooltip on top of element if visible is set to true', function(assert) {
  this.set('visible', false);
  this.render(hbs`<div id="container"><p style="margin-top: 200px"><a href="#" id="target">Hover me{{bs-tooltip title="very very very very very very very long tooltip" fade=false visible=visible}}</a></p></div>`);

  setupForPositioning.call(this);

  this.set('visible', true);
  assertPositioning.call(this, assert);
});

test('should show tooltip if leave event hasn\'t occurred before delay expires', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" delay=150}}</div>`);

  setTimeout(function() {
    assert.notOk(isVisible(find('.tooltip')), '100ms: tooltip is not faded in');
  }, 100);

  setTimeout(function() {
    assert.ok(isVisible(find('.tooltip')), '200ms: tooltip is faded in');
    done();
  }, 200);

  triggerEvent('#target', 'mouseover');
});

test('should not show tooltip if leave event occurs before delay expires', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" delay=150}}</div>`);

  setTimeout(function() {
    assert.notOk(isVisible(find('.tooltip')), '100ms: tooltip not faded in');
    triggerEvent('#target', 'mouseout');
  }, 100);

  setTimeout(function() {
    assert.notOk(isVisible(find('.tooltip')), '200ms: tooltip not faded in');
    done();
  }, 200);

  triggerEvent('#target', 'mouseover');
});

test('should not hide tooltip if leave event occurs and enter event occurs within the hide delay', function(assert) {
  assert.expect(3);
  let done = assert.async();

  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" delayShow=0 delayHide=150}}</div>`);

  setTimeout(function() {
    assert.ok(isVisible(find('.tooltip')), '1ms: tooltip faded in');
    triggerEvent('#target', 'mouseout');

    setTimeout(function() {
      assert.ok(isVisible(find('.tooltip')), '100ms: tooltip still faded in');
      triggerEvent('#target', 'mouseover');
    }, 100);

    setTimeout(function() {
      assert.ok(isVisible(find('.tooltip')), '200ms: tooltip still faded in');
      done();
    }, 200);
  }, 0);

  triggerEvent('#target', 'mouseover');
});

test('should not show tooltip if leave event occurs before delay expires', function(assert) {
  assert.expect(2);
  let done = assert.async();

  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" delay=150}}</div>`);

  setTimeout(function() {
    assert.notOk(isVisible(find('.tooltip')), '100ms: tooltip not faded in');
    triggerEvent('#target', 'mouseout');
  }, 100);

  setTimeout(function() {
    assert.notOk(isVisible(find('.tooltip')), '200ms: tooltip not faded in');
    done();
  }, 200);

  triggerEvent('#target', 'mouseover');
});

test('show pass along class attribute', function(assert) {
  assert.expect(1);
  let done = assert.async();

  this.render(hbs`<div id="target">{{bs-tooltip title="Dummy" class='wide' delay=150}}</div>`);
  setTimeout(function() {
    assert.equal(findAll('.tooltip.wide').length, 1);
    done();
  }, 200);

  triggerEvent('#target', 'mouseover');
});
