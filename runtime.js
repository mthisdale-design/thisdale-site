/* Thisdale — mini moteur de rendu (remplace l'éditeur de maquette) */
(function () {
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function get(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope);
  }
  function whole(v) { var m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(v); return m ? m[1] : null; }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = get(scope, p); return v == null ? '' : String(v); });
  }
  function renderChildren(src, scope, out, after) {
    for (var c = src.firstChild; c; c = c.nextSibling) renderNode(c, scope, out, after);
  }
  function renderNode(node, scope, out, after) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = get(scope, whole(node.getAttribute('list')) || '') || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) {
        var s = Object.create(scope); s[as] = list[i]; s.$index = i;
        renderChildren(node, s, out, after);
      }
      return;
    }
    if (tag === 'sc-if') {
      if (get(scope, whole(node.getAttribute('value')) || 'false')) renderChildren(node, scope, out, after);
      return;
    }
    var el = node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml'
      ? document.createElementNS(node.namespaceURI, node.tagName)
      : document.createElement(tag);
    var valueSet = null;
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      var w = whole(val);
      if (w && name.indexOf('on') === 0) {
        var fn = get(scope, w);
        if (typeof fn === 'function') el.addEventListener(name.slice(2).toLowerCase(), fn);
        continue;
      }
      if (w && name === 'ref') { var rf = get(scope, w); if (typeof rf === 'function') after.push(rf.bind(null, el)); continue; }
      if (w && name === 'value') { var vv = get(scope, w); valueSet = vv == null ? '' : String(vv); el.setAttribute('value', valueSet); continue; }
      el.setAttribute(name, interp(val, scope));
    }
    if (tag === 'template') { el.innerHTML = node.innerHTML; } else renderChildren(node.content || node, scope, el, after);
    if (valueSet !== null) el.value = valueSet;
    out.appendChild(el);
  }

  var st = document.createElement('style');
  st.textContent = '.dc-settled .rise,.dc-settled .rise2,.dc-settled .rise3{animation:none!important}';
  document.head.appendChild(st);

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  DCLogic.prototype.setState = function (u) {
    var v = typeof u === 'function' ? u(this.state) : u;
    this.state = Object.assign({}, this.state, v);
    if (!this.__render) return;
    if (this.__rendering) { this.__again = true; return; }
    this.__rendering = true;
    try { do { this.__again = false; this.__render(); } while (this.__again); } finally { this.__rendering = false; }
  };
  DCLogic.prototype.forceUpdate = function () { this.__render(); };

  window.mountDC = function (Component, tpl, root, hooks) {
    var c = new Component({});
    if (!c.state) c.state = {};
    if (hooks && hooks.init) hooks.init(c);
    c.__render = function () {
      // keep what the visitor typed, the focus, and open FAQ answers
      var keep = {}, active = document.activeElement, sel = null;
      root.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) {
        keep[e.id] = e.type === 'checkbox' ? e.checked : e.value;
      });
      var openDetails = {};
      root.querySelectorAll('details[open] summary').forEach(function (s) { openDetails[s.textContent.trim()] = 1; });
      if (active && active.id && typeof active.selectionStart === 'number') sel = [active.id, active.selectionStart, active.selectionEnd];
      var vals = c.renderVals(), frag = document.createDocumentFragment(), after = [];
      renderChildren(tpl.content, vals, frag, after);
      root.replaceChildren(frag);
      root.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) {
        if (!(e.id in keep) || e.hasAttribute('value') && e.type !== 'checkbox') return;
        if (e.type === 'checkbox') e.checked = keep[e.id]; else e.value = keep[e.id];
      });
      root.querySelectorAll('details summary').forEach(function (s) { if (openDetails[s.textContent.trim()]) s.parentNode.open = true; });
      after.forEach(function (f) { f(); });
      if (sel) { var f2 = document.getElementById(sel[0]); if (f2) { f2.focus({ preventScroll: true }); try { f2.setSelectionRange(sel[1], sel[2]); } catch (e) {} } }
      if (c.__mounted && c.componentDidUpdate) c.componentDidUpdate();
    };
    c.__render();
    c.__mounted = true;
    setTimeout(function () { root.classList.add('dc-settled'); }, 1400);
    if (c.componentDidMount) c.componentDidMount();
    return c;
  };
})();
