/* Blackmoor Hall · app de consulta de textos
   La app no guarda el estado del tablero: solo lo que sabe (variante, Implicado,
   interrogatorios, deducciones, visiones, reacciones…). */
(function () {
  'use strict';

  var VERSION = '2.0.2';
  var LS_AUTO = 'bh2_partida';
  var LS_SAVES = 'bh2_guardadas';
  var LS_PEND = 'bh2_pendientes';

  // ------------------------------------------------------------ utilidades
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escN(s) { return esc(s).replace(/\d+/g, '<span class="dg">$&</span>'); }
  function paras(t) {
    if (Array.isArray(t)) return t.map(paras).join('');
    return '<p>' + esc(t) + '</p>';
  }
  function verdadHtml(lista) {
    return lista.map(function (t, i) {
      var m = /^((?:Los|Las|El|La) [^.]{2,24})\. (.*)$/.exec(t);
      if (i > 0 && m) return '<p><b>' + esc(m[1]) + '.</b> ' + esc(m[2]) + '</p>';
      return '<p>' + esc(t) + '</p>';
    }).join('');
  }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rnd(arr.length)]; }
  function lsGet(k, def) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function lsSet(k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function fecha(ts) {
    var d = new Date(ts);
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return z(d.getDate()) + '/' + z(d.getMonth() + 1) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes());
  }

  // ------------------------------------------------------------ iconos
  var ICON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    talk: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 16.5h.01"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/><path d="M6.5 13.5l1.2.7M12 9v1.4M17.5 13.5l-1.2.7"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 21a2 2 0 0 1 2-2h13v2"/></svg>',
    gavel: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6M11 7l6 6M12.5 5.5l-4 4 6 6 4-4"/><path d="M10 12l-7 7 2 2 7-7"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>'
  };

  // ------------------------------------------------------------ partida
  var S = null; // partida en curso

  function caso(id) {
    id = id || (S && S.caso);
    for (var i = 0; i < BH_CASOS.length; i++) if (BH_CASOS[i].id === id) return BH_CASOS[i];
    return null;
  }
  function TX() { return BH_TEXTOS[caso().textos]; }
  function V() { return S.variante; }
  function pnj(id) { return caso().pnj.filter(function (p) { return p.id === id; })[0]; }
  function pj(id) { return BH_PJ.filter(function (p) { return p.id === id; })[0]; }
  function pistaInfo(n) { return caso().pistas[n]; }
  function conArt(id) { var x = pj(id); return x.art + ' ' + x.nombre; }
  function aPj(id) { var x = pj(id); return (x.art === 'el' ? 'al ' : 'a la ') + x.nombre; }

  function nuevaPartida(casoId, variante, modoVar) {
    S = {
      v: 2, caso: casoId, variante: variante, modoVar: modoVar, creada: Date.now(), act: Date.now(),
      impl: { jugando: false },
      inter: {}, codes: {}, ded: {}, rev: { metodo: false, movil: false },
      vis: 0, reac: {}, n5: {}, conf: {}, hist: [], fin: null
    };
  }
  function autosave() {
    if (!S) return;
    S.act = Date.now();
    if (!lsSet(LS_AUTO, S)) toast('No se ha podido guardar la partida en este dispositivo');
  }
  function addHist(titulo, html) {
    S.hist.push({ t: titulo, h: html, at: Date.now() });
    if (S.hist.length > 200) S.hist.shift();
  }
  function nombreVariante() {
    if (!S) return '';
    return S.modoVar === 'oculta' ? 'Variante oculta' : 'Variante ' + S.variante;
  }
  function desbloqueada() { return S.rev.metodo && S.rev.movil; }

  // ------------------------------------------------------------ navegación
  var stack = [];
  function go(name, params, opt) {
    opt = opt || {};
    var entry = { name: name, p: params || {} };
    if (opt.reset) stack = [entry];
    else if (opt.replace && stack.length) stack[stack.length - 1] = entry;
    else stack.push(entry);
    render();
  }
  function back() {
    var cur = stack[stack.length - 1];
    var def = cur && SCREENS[cur.name];
    if (stack.length <= 1) return false;
    if (cur && cur.noBack) return true;
    stack.pop();
    render();
    return true;
  }
  window.addEventListener('popstate', function () {
    var cur = stack[stack.length - 1];
    if (stack.length > 1) {
      if (!(cur && cur.lock)) back();
      history.pushState({ bh: 1 }, '');
    } else {
      history.back();
    }
  });

  function render() {
    var cur = stack[stack.length - 1];
    var scr = SCREENS[cur.name](cur.p) || {};
    cur.lock = !!scr.lock;
    var showBack = stack.length > 1 && !scr.lock && !scr.noBack;
    var bar = $('#bar');
    $('#bar-back').classList.toggle('hidden', !showBack);
    $('#bar-title').innerHTML = escN(scr.title || 'Blackmoor Hall') + (scr.sub ? '<span class="sub">' + esc(scr.sub) + '</span>' : '');
    var right = $('#bar-right');
    if (scr.home) { right.innerHTML = ICON.home; right.classList.remove('hidden'); right.setAttribute('aria-label', 'Volver a la partida'); right.onclick = function () { go('juego', {}, { reset: true }); }; }
    else if (scr.menu) { right.innerHTML = ICON.menu; right.classList.remove('hidden'); right.setAttribute('aria-label', 'Menú'); right.onclick = function () { go('menu'); }; }
    else { right.classList.add('hidden'); right.onclick = null; }
    var main = $('#main');
    main.innerHTML = scr.html || '';
    window.scrollTo(0, 0);
    if (scr.after) scr.after(main);
  }

  function modal(title, html, buttons) {
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h2>' + escN(title) + '</h2><div class="rule"></div>' + html +
      '<div class="modal-btns"></div></div>';
    var box = $('.modal-btns', back);
    buttons.forEach(function (b) {
      var el = document.createElement('button');
      el.className = 'btn ' + (b.cls || '');
      el.textContent = b.t;
      el.onclick = function () { document.body.removeChild(back); if (b.fn) b.fn(); };
      box.appendChild(el);
    });
    document.body.appendChild(back);
  }

  // ------------------------------------------------------------ piezas de interfaz
  function btn(label, action, cls, note) {
    return '<button class="btn ' + (cls || '') + (note ? ' stack' : '') + '" data-act="' + action + '">' + escN(label) +
      (note ? '<span class="note">' + esc(note) + '</span>' : '') + '</button>';
  }
  function whoBtn(p, act, extraCls, extra) {
    var num = p.num ? '<span class="num" style="background:' + p.color + '">' + p.num + '</span>' : '';
    return '<button class="who ' + (extraCls || '') + '" data-act="' + act + '"><img src="' + p.img + '" alt="">' +
      '<span class="name">' + num + esc(p.nombre) + '</span>' + (extra || '') + '</button>';
  }
  function whoInline(p) {
    return '<div class="who-inline"><img src="' + p.img + '" alt=""><div class="name">' + esc(p.largo || p.nombre) + '</div></div>';
  }
  function card(kicker, bodyHtml) {
    return '<div class="card">' + (kicker ? '<div class="kicker">' + escN(kicker) + '</div>' : '') + '<div class="say">' + bodyHtml + '</div></div>';
  }
  function effect(t, cls) { return '<div class="effect ' + (cls || '') + '">' + esc(t) + '</div>'; }
  function bind(root, map) {
    $$('[data-act]', root).forEach(function (el) {
      var a = el.getAttribute('data-act');
      var name = a.split(':')[0], arg = a.slice(name.length + 1);
      if (map[name]) el.addEventListener('click', function (ev) { ev.preventDefault(); map[name](arg, el); });
    });
  }

  // ------------------------------------------------------------ lógica: reacciones de Sospecha
  function reaccion(pid, nivel) {
    var R = TX().reacciones[pid], P = pnj(pid), out = { textos: [], efectos: [] };
    function usar(n) {
      var lista = R['n' + n], key = pid + '-n' + n;
      var usadas = S.reac[key] || [];
      var libres = [];
      for (var i = 0; i < lista.length; i++) if (usadas.indexOf(i) < 0) libres.push(i);
      if (!libres.length) { usadas = []; libres = lista.map(function (_, i) { return i; }); }
      var i2 = pick(libres);
      usadas.push(i2); S.reac[key] = usadas;
      return lista[i2];
    }
    if (nivel === 1 || nivel === 2 || nivel === 4) {
      var r = usar(nivel);
      out.textos.push(r.t);
      if (r.ef) {
        if (r.ef.tipo === 'marcha') out.efectos.push({ t: 'Tirad 1D4: ' + P.el + ' sale por la puerta de esa dirección (si no la hay, por la siguiente en el sentido de las agujas del reloj).' });
        else if (r.ef.tipo === 'va') out.efectos.push({ t: 'Poned ' + P.a + (r.ef.art === 'al' ? ' en el ' : ' en la ') + r.ef.destino + '.' });
        else if (r.ef.tipo === 'tem') out.efectos.push({ t: 'Los jugadores que estén en la loseta ' + P.de + ' pierden 1 TEM.' });
      }
    } else if (nivel === 3) {
      var I = S.impl;
      if (I && I.jugando && I.hay && I.testigo === pid && !I.testigoHablo && R.testigo) {
        I.testigoHablo = true;
        out.textos.push(R.testigo.texto);
        out.efectos.push({ t: R.testigo.nota });
      } else {
        out.textos.push(R.n3[V()]);
      }
    } else if (nivel === 5) {
      out.textos.push(R.n5[V()]);
      if (!S.n5[pid]) {
        S.n5[pid] = true;
        out.efectos.push({ t: '+1 Alerta: es la primera vez que ' + P.el + ' llega a Sospecha 5.' });
      }
      if (R.conf === V() && !S.conf[pid]) {
        S.conf[pid] = true;
        out.efectos.push({ t: '−1 Temple a los jugadores de la loseta.' });
        out.efectos.push({ t: '−1 Alerta.' });
      }
      out.efectos.push({ t: 'La Sospecha no pasa de 5.', cls: 'info' });
    }
    var html = card(P.nombre + ' · Sospecha ' + nivel, paras(out.textos)) + out.efectos.map(function (e) { return effect(e.t, e.cls); }).join('');
    addHist(P.nombre + ' · Sospecha ' + nivel, html);
    autosave();
    return html;
  }

  // ------------------------------------------------------------ lógica: deducción
  function deducir(a, b) {
    var ca = pistaInfo(a).c, cb = pistaInfo(b).c;
    if (ca !== cb) return { mezcla: true };
    var lo = Math.min(a, b), hi = Math.max(a, b), key = lo + '-' + hi;
    var d = TX().deducciones[key], e = d ? d[V()] : { tipo: 'SIN RELACIÓN', t: TX().sinRelacion };
    var ya = !!S.ded[key];
    S.ded[key] = true;
    var res = { key: key, texto: e.t, ya: ya, rev: null, nueva: false, desbloq: false, color: ca };
    if (e.tipo === 'REVELACIÓN') {
      var campo = ca === 'roja' ? 'metodo' : 'movil';
      res.rev = campo;
      if (!S.rev[campo]) {
        var antes = desbloqueada();
        S.rev[campo] = true; res.nueva = true;
        res.desbloq = !antes && desbloqueada();
      }
    }
    return res;
  }

  // ------------------------------------------------------------ lógica: acusación
  function puntuar(acusados, metodo) {
    var cul = caso().culpables[V()];
    var todos = cul.every(function (c) { return acusados.indexOf(c) >= 0; });
    var alguno = cul.some(function (c) { return acusados.indexOf(c) >= 0; });
    var inocentes = acusados.some(function (a) { return cul.indexOf(a) < 0; });
    var m = metodo === caso().metodoCorrecto;
    var pts, tipo;
    if (todos && !inocentes) { pts = m ? 10 : 7; tipo = 'total'; }
    else if (alguno) { pts = m ? 5 : 4; tipo = 'parcial'; }
    else { pts = m ? 1 : 0; tipo = 'ninguno'; }
    var epi = todos ? 'correcta' : (alguno ? 'parcial' : 'fallida');
    return { pts: pts, tipo: tipo, epilogo: epi, resuelto: todos, metodo: m, culpables: cul, inocentes: inocentes };
  }

  // ------------------------------------------------------------ pantallas
  var SCREENS = {};

  // ---- inicio
  SCREENS.home = function () {
    var auto = lsGet(LS_AUTO, null);
    var html = '<div class="home-hero"><div class="title">Blackmoor Hall</div><div class="tag">Misterio, deducción y traición en la mansión victoriana</div><div class="orn">◆ ◆ ◆</div></div>';
    if (auto && !auto.fin && caso(auto.caso)) {
      var c = caso(auto.caso);
      html += btn('Continuar partida', 'continuar', '', 'Caso ' + c.numero + ' · ' + (auto.modoVar === 'oculta' ? 'Variante oculta' : 'Variante ' + auto.variante) + ' · ' + fecha(auto.act));
      html += btn('Nueva partida', 'nueva', 'secondary');
    } else {
      html += btn('Nueva partida', 'nueva');
    }
    html += btn('Partidas guardadas', 'guardadas', 'quiet');
    html += '<p class="foot">La app solo muestra textos: el tablero, las cartas y los contadores están en la mesa.<br>Versión ' + VERSION + '</p>';
    return {
      title: 'Blackmoor Hall', html: html, after: function (m) {
        bind(m, {
          continuar: function () {
            S = lsGet(LS_AUTO, null);
            if (S.impl && S.impl.jugando && !S.impl.repartoHecho) go('reparto', {}, { reset: true });
            else go('juego', {}, { reset: true });
          },
          nueva: function () {
            if (auto && !auto.fin) {
              modal('¿Empezar una partida nueva?', '<p>La partida en curso se perderá, salvo que la hayáis guardado desde el menú de la partida.</p>', [
                { t: 'Sí, empezar otra', fn: function () { go('casos'); } },
                { t: 'Cancelar', cls: 'secondary' }]);
            } else go('casos');
          },
          guardadas: function () { go('guardadas'); }
        });
      }
    };
  };

  SCREENS.casos = function () {
    var html = '<h2>Elegid el caso</h2><div class="rule"></div>';
    BH_CASOS.forEach(function (c) {
      html += '<button class="cover" data-act="caso:' + c.id + '"><img src="' + c.portada + '" alt="Caso ' + c.numero + ': ' + esc(c.titulo) + '"></button>';
      html += btn('Caso ' + c.numero + ' · ' + c.titulo, 'caso:' + c.id);
    });
    return {
      title: 'Nueva partida', html: html, after: function (m) {
        bind(m, {
          caso: function (id) {
            var pend = lsGet(LS_PEND, {});
            if (pend[id]) {
              modal('Tenéis un caso pendiente', '<p>La última vez guardasteis el misterio de este caso sin ver la verdad. ¿Queréis volver a intentarlo? Jugaréis la misma variante, desde el principio, sin que la app os diga cuál es.</p>', [
                { t: 'Sí, volver a intentarlo', fn: function () { nuevaPartida(id, pend[id].variante, 'oculta'); S.reintento = true; go('implicado'); } },
                { t: 'No, partida nueva', cls: 'secondary', fn: function () { go('variante', { caso: id }); } }]);
            } else go('variante', { caso: id });
          }
        });
      }
    };
  };

  SCREENS.variante = function (p) {
    var html = '<h2>Variante</h2><div class="rule"></div><p class="lead">Cada caso tiene tres variantes: el mismo crimen, otra verdad.</p>';
    ['A', 'B', 'C'].forEach(function (v) {
      html += '<button class="option" data-act="v:' + v + '"><div class="ot">Variante ' + v + '</div></button>';
    });
    html += '<button class="option" data-act="v:oculta"><div class="ot">Variante oculta</div><div class="od">La app sortea la variante y no os dice cuál es. Lo sabréis al final.</div></button>';
    return {
      title: 'Nueva partida', html: html, after: function (m) {
        bind(m, {
          v: function (v) {
            var modo = 'elegida', vv = v;
            if (v === 'oculta') { vv = 'ABC'[rnd(3)]; modo = v; }
            nuevaPartida(p.caso, vv, modo);
            go('implicado');
          }
        });
      }
    };
  };

  SCREENS.implicado = function () {
    var html = '<h2>¿Jugáis con el Implicado?</h2><div class="rule"></div>' +
      '<p>Variante opcional: puede que uno de vosotros ayudara al culpable sin saberlo y quiera que no se descubra. La app reparte los papeles en secreto.</p>';
    html += btn('Sí, con el Implicado', 'si') + btn('No', 'no', 'secondary');
    return {
      title: 'Nueva partida', sub: nombreVariante(), html: html, after: function (m) {
        bind(m, {
          si: function () { go('jugadores'); },
          no: function () { S.impl = { jugando: false }; empezar(); }
        });
      }
    };
  };

  function empezar() {
    if (S.reintento) {
      var pend = lsGet(LS_PEND, {}); delete pend[S.caso]; lsSet(LS_PEND, pend); delete S.reintento;
    }
    autosave();
    go('juego', {}, { reset: true });
  }

  SCREENS.jugadores = function () {
    var html = '<h2>¿Cuántos jugadores sois?</h2><div class="rule"></div><div class="btn-row">' +
      [3, 4, 5].map(function (n) { return btn(String(n), 'n:' + n); }).join('') + '</div>';
    return {
      title: 'El Implicado', sub: nombreVariante(), html: html, after: function (m) {
        bind(m, {
          n: function (n) {
            n = +n;
            S.impl = {
              jugando: true, n: n, hay: Math.random() < n / (n + 1), idx: rnd(n),
              testigo: pick(caso().testigos), jugadores: [], implPj: null, testigoHablo: false, repartoHecho: false
            };
            autosave();
            go('reparto', {}, { reset: true });
          }
        });
      }
    };
  };

  SCREENS.reparto = function () {
    var I = S.impl, k = I.jugadores.length + 1;
    var html = '<h2>Jugador <span class="dg">' + k + '</span> de <span class="dg">' + I.n + '</span></h2><div class="rule"></div><p>Toca el retrato de tu personaje para ver tu papel en secreto.</p><div class="grid3">';
    BH_PJ.forEach(function (x) { if (I.jugadores.indexOf(x.id) < 0) html += whoBtn(x, 'pj:' + x.id); });
    html += '</div>';
    return {
      title: 'Reparto de papeles', lock: true, html: html, after: function (m) {
        bind(m, {
          pj: function (id) {
            var es = I.hay && I.jugadores.length === I.idx;
            I.jugadores.push(id);
            if (es) I.implPj = id;
            autosave();
            go('papel', { pj: id, es: es }, { replace: true });
          }
        });
      }
    };
  };

  SCREENS.papel = function (p) {
    var C = caso(), x = pj(p.pj), html = whoInline(x);
    if (p.es) {
      html += card('Tu papel', '<p><b>Eres el Implicado.</b></p>' + paras(C.implicado.texto) + paras(C.implicado.aviso[S.impl.testigo]) +
        '<p><i>Puedes mentir sobre tu Confidencia: nadie puede comprobarla.</i></p>');
    } else {
      html += card('Tu papel', '<p><b>No eres el Implicado.</b></p><p>No tienes ninguna conexión oculta con los hechos de esta noche. Investiga con libertad y sin secretos.</p>' +
        '<p>Tu objetivo: resolver el caso. Y si durante la partida aparece el token de Implicado, descubrir quién de vosotros no está contando toda la verdad.</p>' +
        '<p><i>Recuerda: alguno de los demás investigadores podría estar ocultando algo. Al final, la app revelará si había un Implicado y quién era.</i></p>');
    }
    html += btn('Ya lo he leído', 'ok');
    return {
      title: 'Tu papel', lock: true, html: html, after: function (m) {
        bind(m, { ok: function () { go('pasar', {}, { replace: true }); } });
      }
    };
  };

  SCREENS.pasar = function () {
    var I = S.impl, fin = I.jugadores.length >= I.n, html;
    if (fin) {
      I.repartoHecho = true; autosave();
      html = '<div class="pass"><div class="big">Todos conocéis ya vuestro papel.</div><p>Empieza la partida.</p>' + btn('Empezar', 'go') + '</div>';
    } else {
      html = '<div class="pass"><div class="big">Pasa el móvil al siguiente jugador</div><p>sin mirar la pantalla.</p>' + btn('Siguiente', 'next') + '</div>';
    }
    return {
      title: 'Reparto de papeles', lock: true, html: html, after: function (m) {
        bind(m, {
          next: function () { go('reparto', {}, { replace: true }); },
          go: function () { empezar(); }
        });
      }
    };
  };

  // ---- partida
  SCREENS.juego = function () {
    var C = caso();
    var html = '<div class="status"><div class="chip ' + (S.rev.metodo ? 'on' : '') + '"><span class="dot"></span>Revelación de método</div>' +
      '<div class="chip ' + (S.rev.movil ? 'on' : '') + '"><span class="dot"></span>Revelación de móvil</div></div>';
    html += '<div class="hub">' +
      '<button class="tile" data-act="go:codigo">' + ICON.code + 'Código de carta</button>' +
      '<button class="tile" data-act="go:interrogar">' + ICON.talk + 'Interrogar</button>' +
      '<button class="tile" data-act="go:deducir">' + ICON.link + 'Deducir</button>' +
      '<button class="tile" data-act="go:sospecha">' + ICON.gauge + 'Sospecha<span class="note">cuando sube</span></button>' +
      '<button class="tile" data-act="go:vision">' + ICON.eye + 'Visión<span class="note">Médium</span></button>' +
      '<button class="tile" data-act="go:historial">' + ICON.book + 'Lo leído</button>';
    if (desbloqueada()) html += '<button class="tile wide accent" data-act="acusar">' + ICON.gavel + 'Acusar</button>';
    html += '</div>';
    if (!desbloqueada()) html += '<p class="small muted center">El botón Acusar aparecerá cuando tengáis una Revelación de método y otra de móvil.</p>';
    html += btn('Hemos perdido', 'perdido', 'danger');
    return {
      title: 'Caso ' + C.numero, sub: nombreVariante(), menu: true, html: html, after: function (m) {
        bind(m, {
          go: function (s) { go(s); },
          acusar: function () {
            modal('Acusar', '<p>Se acusa al final del paso de Acciones, cuando todos hayan jugado su turno. Lo decide el grupo.</p><p>Una vez confirmada, la acusación no se puede deshacer y la partida termina.</p>', [
              { t: 'Continuar', fn: function () { iniciarAcusacion(); } }, { t: 'Cancelar', cls: 'secondary' }]);
          },
          perdido: function () {
            modal('¿Habéis perdido?', '<p>Pulsadlo si la Alerta ha llegado a 10 o si ha terminado la última ronda sin que hayáis acusado.</p>', [
              { t: 'Sí, hemos perdido', cls: 'danger', fn: function () { derrota(); } }, { t: 'Cancelar', cls: 'secondary' }]);
          }
        });
      }
    };
  };

  SCREENS.menu = function () {
    var html = '<h2>Menú</h2><div class="rule"></div>' +
      btn('Guardar partida', 'guardar', '', 'Se guarda también sola después de cada consulta') +
      btn('Partidas guardadas', 'lista', 'quiet') +
      btn('Volver al inicio', 'inicio', 'secondary');
    return {
      title: 'Caso ' + caso().numero, sub: nombreVariante(), html: html, after: function (m) {
        bind(m, {
          guardar: function () {
            var saves = lsGet(LS_SAVES, []);
            saves.unshift({ id: Date.now(), nombre: 'Caso ' + caso().numero + ' · ' + nombreVariante(), fecha: Date.now(), s: S });
            if (saves.length > 20) saves.length = 20;
            toast(lsSet(LS_SAVES, saves) ? 'Partida guardada' : 'No se ha podido guardar');
          },
          lista: function () { go('guardadas'); },
          inicio: function () { autosave(); go('home', {}, { reset: true }); }
        });
      }
    };
  };

  SCREENS.guardadas = function () {
    var saves = lsGet(LS_SAVES, []);
    var html = '<h2>Partidas guardadas</h2><div class="rule"></div>';
    if (!saves.length) html += '<p class="muted">No hay ninguna partida guardada. Podéis guardar desde el menú de la partida.</p>';
    else {
      html += '<div class="saves">';
      saves.forEach(function (g, i) {
        html += '<div class="save"><div class="info"><b>' + esc(g.nombre) + '</b><br><span class="small muted">' + fecha(g.fecha) + '</span></div>' +
          '<button class="btn" data-act="cargar:' + i + '">Cargar</button><button class="btn danger" data-act="borrar:' + i + '">Borrar</button></div>';
      });
      html += '</div>';
    }
    return {
      title: 'Partidas guardadas', html: html, after: function (m) {
        bind(m, {
          cargar: function (i) {
            var g = saves[+i];
            modal('¿Cargar esta partida?', '<p>' + esc(g.nombre) + ', guardada el ' + fecha(g.fecha) + '.</p><p>Sustituirá a la partida en curso.</p>', [
              { t: 'Cargar', fn: function () { S = JSON.parse(JSON.stringify(g.s)); autosave(); go('juego', {}, { reset: true }); } },
              { t: 'Cancelar', cls: 'secondary' }]);
          },
          borrar: function (i) {
            modal('¿Borrar esta partida?', '<p>' + esc(saves[+i].nombre) + '</p>', [
              { t: 'Borrar', cls: 'danger', fn: function () { saves.splice(+i, 1); lsSet(LS_SAVES, saves); render(); } },
              { t: 'Cancelar', cls: 'secondary' }]);
          }
        });
      }
    };
  };

  // ---- código de carta
  SCREENS.codigo = function (p) {
    var html = '<h2>Código de carta</h2><div class="rule"></div><p>Escribid el código que aparece en la carta (por ejemplo, el de una forma de interpretar una pista).</p>' +
      '<input id="code" class="code-input" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8" value="' + esc(p.v || '') + '">' +
      '<div class="error" id="err">' + esc(p.err || '') + '</div>' + btn('Consultar', 'ok');
    return {
      title: 'Código de carta', home: true, html: html, after: function (m) {
        var inp = $('#code', m);
        setTimeout(function () { inp.focus(); }, 50);
        function ok() {
          var raw = inp.value, code = raw.toUpperCase().replace(/[\s\-_.·]/g, '');
          var e = TX().codigos[code];
          if (!e) { $('#err', m).textContent = 'No existe ese código. Comprobad que lo habéis escrito bien.'; return; }
          go('codigoRes', resolverCodigo(code), { replace: true });
        }
        inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ok(); });
        bind(m, { ok: ok });
      }
    };
  };

  function resolverCodigo(code) {
    var e = TX().codigos[code], ya = !!S.codes[code];
    S.codes[code] = true;
    var m = /^Con ([^:]+):/.exec(e.titulo), quien = null;
    if (m) caso().pnj.forEach(function (x) { if (m[1].indexOf(x.id.charAt(0).toUpperCase() + x.id.slice(1)) >= 0) quien = x.id; });
    var titulo = 'Pista ' + e.pista + ' · ' + e.titulo;
    var body = (e.comun ? paras(e.comun) : '') + paras(e[V()]);
    var html = card(titulo, body);
    addHist(code + ' · ' + titulo, html);
    autosave();
    return { code: code, titulo: titulo, html: html, ya: ya, sube: ya ? null : e.sosp[V()], quien: quien, pista: e.pista };
  }

  SCREENS.codigoRes = function (p) {
    var html = (p.ya ? effect('Ya habíais consultado este código.', 'info') : '') + p.html;
    html += effect('Cambiad la pista #' + p.pista + ' descubierta por su carta interpretada.', 'info');
    var after;
    if (p.sube) {
      html += effect('Subid +1 la Sospecha ' + pnj(p.sube).de + ' en su contador.');
      html += btn('Continuar', 'sos');
      after = function (m) { bind(m, { sos: function () { go('nivel', { pnj: p.sube, from: 'sube' }, { replace: true }); } }); };
    } else {
      if (p.quien && !p.ya) html += effect('La Sospecha ' + pnj(p.quien).de + ' no cambia.', 'info');
      html += btn('Volver a la partida', 'fin');
      after = function (m) { bind(m, { fin: function () { go('juego', {}, { reset: true }); } }); };
    }
    return { title: p.code, home: true, lock: true, html: html, after: after };
  };

  // ---- nivel de Sospecha y reacción
  SCREENS.nivel = function (p) {
    var P = pnj(p.pnj);
    var html = whoInline(P);
    html += '<h2>¿En qué nivel queda su Sospecha?</h2><div class="rule"></div>';
    if (p.from === 'sube') html += '<p>Mirad el contador ' + esc(P.de) + ' después de subirlo.</p>';
    else html += '<p>Indicad el nivel al que acaba de subir. Cuando la Sospecha baja, no hace falta consultar la app.</p>';
    html += '<div class="levels">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-act="n:' + n + '">' + n + '</button>'; }).join('') + '</div>';
    if (p.from === 'sube') html += btn('Ya estaba en 5', 'cinco', 'quiet');
    return {
      title: 'Sospecha', home: true, lock: p.from === 'sube', html: html, after: function (m) {
        bind(m, {
          n: function (n) { go('reaccion', { pnj: p.pnj, html: reaccion(p.pnj, +n) }, { replace: true }); },
          cinco: function () { go('reaccion', { pnj: p.pnj, html: effect('La Sospecha no pasa de 5: no ocurre nada más.', 'info') }, { replace: true }); }
        });
      }
    };
  };

  SCREENS.reaccion = function (p) {
    return {
      title: 'Sospecha', home: true, lock: true, html: p.html + btn('Volver a la partida', 'fin'), after: function (m) {
        bind(m, { fin: function () { go('juego', {}, { reset: true }); } });
      }
    };
  };

  SCREENS.sospecha = function () {
    var html = '<h2>¿A quién le ha subido la Sospecha?</h2><div class="rule"></div><p class="small muted">Usadlo cuando una carta o un Suceso sube la Sospecha de un PNJ. Después de un interrogatorio, la app os lo pregunta sola.</p><div class="grid3">';
    caso().pnj.forEach(function (x) { html += whoBtn(x, 'p:' + x.id); });
    html += '</div>';
    return {
      title: 'Sospecha', home: true, html: html, after: function (m) {
        bind(m, { p: function (id) { go('nivel', { pnj: id, from: 'menu' }); } });
      }
    };
  };

  // ---- interrogar
  SCREENS.interrogar = function () {
    var html = '<h2>¿A quién interrogáis?</h2><div class="rule"></div><p class="small muted">El primer interrogatorio a cada PNJ es su Declaración inicial: dad la vuelta a su carta y leedla. Después, interrogadle aquí con una pista interpretada.</p><div class="grid3">';
    caso().pnj.forEach(function (x) { html += whoBtn(x, 'p:' + x.id); });
    html += '</div>';
    return {
      title: 'Interrogar', home: true, html: html, after: function (m) {
        bind(m, { p: function (id) { go('intPista', { pnj: id }); } });
      }
    };
  };

  function numsGrid(sel) {
    var html = '<div class="nums">';
    for (var i = 1; i <= 14; i++) html += '<button class="num-btn ' + pistaInfo(i).c + (sel && sel.indexOf(i) >= 0 ? ' sel' : '') + '" data-act="n:' + i + '">' + i + '</button>';
    return html + '</div><div class="legend"><span class="r">Roja</span><span class="a">Azul</span></div>';
  }

  SCREENS.intPista = function (p) {
    var P = pnj(p.pnj);
    var html = whoInline(P) + '<h2>¿Con qué pista interpretada?</h2><div class="rule"></div>' + numsGrid();
    return {
      title: 'Interrogar', home: true, html: html, after: function (m) {
        bind(m, { n: function (n) { go('intPrueba', { pnj: p.pnj, pista: +n }); } });
      }
    };
  };

  SCREENS.intPrueba = function (p) {
    var P = pnj(p.pnj), e = TX().interrogatorios[p.pnj][p.pista], key = p.pnj + '-' + p.pista;
    var titulo = 'Pista ' + p.pista + ' · ' + pistaInfo(p.pista).t;
    var html = whoInline(P) + '<div class="badge gold">' + escN(titulo) + '</div>';
    if (!e) {
      html += card(P.nombre, paras(TX().resto[p.pnj]));
      html += effect('Esta pista no le dice nada: no hay prueba y su Sospecha no sube. Gastáis la acción igualmente.', 'info');
      html += btn('Volver a la partida', 'fin');
      return {
        title: 'Interrogar', home: true, html: html, after: function (m) {
          if (!p.logged) { addHist(P.nombre + ' · ' + titulo, card(P.nombre, paras(TX().resto[p.pnj]))); autosave(); p.logged = true; }
          bind(m, { fin: function () { go('juego', {}, { reset: true }); } });
        }
      };
    }
    if (S.inter[key] === 'ok') {
      html += effect('Ya superasteis este interrogatorio: os repite lo que os dijo. No gastáis la acción ni hacéis prueba.', 'info');
      html += card(P.nombre, paras(e.exito[V()]));
      html += btn('Volver a la partida', 'fin');
      return { title: 'Interrogar', home: true, html: html, after: function (m) { bind(m, { fin: function () { go('juego', {}, { reset: true }); } }); } };
    }
    html += '<h2>Prueba de ' + e.attr + ' <span class="dg">' + e.dif + '</span></h2><div class="rule"></div>' +
      '<p>Sumad a la dificultad el modificador de Alerta y aplicad la ventaja o la desventaja, si la tenéis.</p>' +
      (S.inter[key] === 'fail' ? effect('Ya fallasteis este interrogatorio antes. Podéis volver a intentarlo.', 'info') : '') +
      '<div class="btn-row">' + btn('Éxito', 'r:ok') + btn('Fracaso', 'r:fail', 'secondary') + '</div>';
    return {
      title: 'Interrogar', home: true, html: html, after: function (m) {
        bind(m, {
          r: function (r) {
            S.inter[key] = r === 'ok' ? 'ok' : 'fail';
            var body = paras(r === 'ok' ? e.exito[V()] : e.fracaso);
            addHist(P.nombre + ' · ' + titulo + (r === 'ok' ? ' · Éxito' : ' · Fracaso'), card(P.nombre, body));
            autosave();
            go('intRes', { pnj: p.pnj, pista: p.pista, r: r }, { replace: true });
          }
        });
      }
    };
  };

  SCREENS.intRes = function (p) {
    var P = pnj(p.pnj), e = TX().interrogatorios[p.pnj][p.pista], v = V();
    var titulo = 'Pista ' + p.pista + ' · ' + pistaInfo(p.pista).t;
    var html = whoInline(P) + '<div class="badge ' + (p.r === 'ok' ? 'ok' : '') + '">' + (p.r === 'ok' ? 'Éxito' : 'Fracaso') + '</div>';
    html += card(titulo, paras(p.r === 'ok' ? e.exito[v] : e.fracaso));
    var ojoPendiente = p.r === 'fail' && e.ojo && !p.extra;
    if (p.extra) html += card(p.extra === 'ojo' ? 'Ojo entrenado · Inspector' : 'Prensa · Periodista', paras(p.extra === 'ojo' ? e.ojo[v] : e.prensa[v]));
    var nosube = p.r === 'ok' && e.nosube[v];
    if (ojoPendiente) {
      html += '<p class="small muted center">Solo si ha interrogado el Inspector o el Periodista:</p>' +
        btn('Ojo entrenado', 'x:ojo', 'secondary', 'solo el Inspector') + btn('Prensa', 'x:prensa', 'secondary', 'solo el Periodista') + btn('Cerrar', 'x:no', 'quiet');
    } else if (nosube) {
      html += effect('Su Sospecha no sube.', 'info') + btn('Volver a la partida', 'fin');
    } else {
      html += effect('Subid +1 la Sospecha ' + P.de + ' en su contador.') + btn('Continuar', 'sos');
    }
    return {
      title: 'Interrogar', home: true, lock: true, html: html, after: function (m) {
        bind(m, {
          x: function (x) {
            if (x !== 'no') {
              addHist(P.nombre + ' · ' + titulo + ' · ' + (x === 'ojo' ? 'Ojo entrenado' : 'Prensa'), card(x === 'ojo' ? 'Ojo entrenado' : 'Prensa', paras(x === 'ojo' ? e.ojo[v] : e.prensa[v])));
              autosave();
            }
            go('intRes', { pnj: p.pnj, pista: p.pista, r: p.r, extra: x === 'no' ? 'none' : x }, { replace: true });
          },
          fin: function () { go('juego', {}, { reset: true }); },
          sos: function () { go('nivel', { pnj: p.pnj, from: 'sube' }, { replace: true }); }
        });
      }
    };
  };

  // ---- deducir
  SCREENS.deducir = function (p) {
    var sel = p.sel || [];
    var html = '<h2>Elegid dos pistas interpretadas</h2><div class="rule"></div><p class="small muted">Del mismo color: dos rojas (método) o dos azules (móvil).</p>' + numsGrid(sel) +
      '<button class="btn" data-act="ok"' + (sel.length === 2 ? '' : ' disabled') + '>Deducir' + (sel.length === 2 ? ' #' + sel[0] + ' + #' + sel[1] : '') + '</button>';
    return {
      title: 'Deducir', home: true, html: html, after: function (m) {
        bind(m, {
          n: function (n) {
            n = +n; var s = sel.slice(), i = s.indexOf(n);
            if (i >= 0) s.splice(i, 1); else { if (s.length === 2) s.shift(); s.push(n); }
            s.sort(function (a, b) { return a - b; });
            go('deducir', { sel: s }, { replace: true });
          },
          ok: function () {
            var r = deducir(sel[0], sel[1]);
            if (r.mezcla) { go('dedRes', { sel: sel, mezcla: true }, { replace: true }); return; }
            var html = card('Pistas #' + sel[0] + ' + #' + sel[1], paras(r.texto));
            if (r.rev && r.nueva) html += effect('Revelación de ' + (r.rev === 'metodo' ? 'método' : 'móvil') + ' conseguida.', 'good');
            if (r.desbloq) html += effect('Acusación desbloqueada: ya podéis acusar al final de un paso de Acciones.', 'good');
            if (!r.ya) addHist('Deducción #' + sel[0] + ' + #' + sel[1], html);
            autosave();
            go('dedRes', { sel: sel, html: html, ya: r.ya }, { replace: true });
          }
        });
      }
    };
  };

  SCREENS.dedRes = function (p) {
    var html;
    if (p.mezcla) html = card('Pistas #' + p.sel[0] + ' + #' + p.sel[1], '<p>Solo podéis combinar pistas del mismo color.</p>') + effect('No gastáis la acción.', 'info');
    else html = (p.ya ? effect('Ya lo habíais deducido: no gastáis la acción.', 'info') : '') + p.html;
    html += btn('Volver a la partida', 'fin');
    return { title: 'Deducir', home: true, lock: !p.mezcla, html: html, after: function (m) { bind(m, { fin: function () { go('juego', {}, { reset: true }); } }); } };
  };

  // ---- visión
  SCREENS.vision = function (p) {
    var html;
    if (p.html) {
      html = p.html + btn('Volver a la partida', 'fin');
    } else {
      html = whoInline(pj('medium')) + '<p>Pulsad el botón cada vez que la Médium pierda Temple.</p>' + btn('Recibir la visión', 'ver') + btn('Cancelar', 'fin', 'secondary');
    }
    return {
      title: 'Visión', home: true, lock: !!p.html, html: html, after: function (m) {
        bind(m, {
          ver: function () {
            var lista = TX().visiones[V()], h;
            if (S.vis < lista.length) { h = card('Visión ' + (S.vis + 1), paras(lista[S.vis])); S.vis++; addHist('Visión ' + S.vis, h); autosave(); }
            else h = card('Visión', paras(TX().visionesAgotadas));
            go('vision', { html: h }, { replace: true });
          },
          fin: function () { go('juego', {}, { reset: true }); }
        });
      }
    };
  };

  // ---- historial
  SCREENS.historial = function () {
    var html = '<h2>Lo que habéis leído</h2><div class="rule"></div>';
    if (!S.hist.length) html += '<p class="muted">Todavía no habéis consultado nada en esta partida.</p>';
    for (var i = S.hist.length - 1; i >= 0; i--) {
      var h = S.hist[i];
      html += '<details class="hist-item"><summary>' + escN(h.t) + ' <span class="when">' + fecha(h.at).split(' ')[1] + '</span></summary><div class="hist-body">' + h.h + '</div></details>';
    }
    return { title: 'Lo leído', home: true, html: html };
  };

  // ---- acusar
  function iniciarAcusacion() {
    var I = S.impl;
    if (I && I.jugando && I.testigoHablo && !(S.voto && S.voto.hecho)) go('voto');
    else go('acusar');
  }

  SCREENS.voto = function (p) {
    var I = S.impl, sel = p.sel;
    var html = '<h2>¿A quién acusáis de ser el Implicado?</h2><div class="rule"></div><p>Votad en la mesa. Gana la mayoría; si hay empate, no se acusa a nadie.</p><div class="grid3">';
    I.jugadores.forEach(function (id) { html += whoBtn(pj(id), 's:' + id, sel === id ? 'sel' : ''); });
    html += '</div><button class="option ' + (sel === 'nadie' ? 'sel' : '') + '" data-act="s:nadie"><div class="ot">No acusar a nadie</div></button>' +
      '<button class="btn" data-act="ok"' + (sel ? '' : ' disabled') + '>Confirmar</button>';
    return {
      title: 'El Implicado', html: html, after: function (m) {
        bind(m, {
          s: function (id) { go('voto', { sel: id }, { replace: true }); },
          ok: function () {
            modal('¿Confirmáis el voto?', '<p>' + (sel === 'nadie' ? 'No acusáis a nadie.' : 'Acusáis ' + esc(aPj(sel)) + '.') + ' No se puede deshacer.</p>', [
              { t: 'Confirmar', fn: function () { S.voto = { hecho: true, a: sel }; autosave(); go('votoRes', {}, { replace: true }); } },
              { t: 'Cancelar', cls: 'secondary' }]);
          }
        });
      }
    };
  };

  SCREENS.votoRes = function () {
    var I = S.impl, x = pj(I.implPj);
    var html = '<h2>El Implicado era…</h2><div class="rule"></div>' + whoInline(x);
    html += S.voto.a === I.implPj ? effect('¡Le habéis descubierto!', 'good') : effect(S.voto.a === 'nadie' ? 'No acusasteis a nadie.' : 'Os habéis equivocado.', 'info');
    html += '<p>Ahora, la acusación del crimen.</p>' + btn('Continuar', 'ok');
    return { title: 'El Implicado', lock: true, html: html, after: function (m) { bind(m, { ok: function () { go('acusar', {}, { replace: true }); } }); } };
  };

  SCREENS.acusar = function (p) {
    var sel = p.sel || [], met = p.met;
    var html = '<h2>¿A quién acusáis?</h2><div class="rule"></div><p class="small muted">Marcad uno o varios.</p><div class="grid3">';
    caso().pnj.forEach(function (x) { html += whoBtn(x, 'p:' + x.id, sel.indexOf(x.id) >= 0 ? 'sel' : '', '<span class="check">' + (sel.indexOf(x.id) >= 0 ? '✔ Acusado' : '') + '</span>'); });
    html += '</div><h3>¿Cómo se cometió el crimen?</h3>';
    caso().metodos.forEach(function (t, i) { html += '<button class="radio ' + (met === i ? 'sel' : '') + '" data-act="m:' + i + '"><span class="mark"></span>' + esc(t) + '</button>'; });
    html += '<br><button class="btn" data-act="ok"' + (sel.length && met != null ? '' : ' disabled') + '>Acusar</button>';
    return {
      title: 'Acusar', lock: !!(S.voto && S.voto.hecho), html: html, after: function (m) {
        bind(m, {
          p: function (id) { var s = sel.slice(), i = s.indexOf(id); if (i >= 0) s.splice(i, 1); else s.push(id); go('acusar', { sel: s, met: met }, { replace: true }); },
          m: function (i) { go('acusar', { sel: sel, met: +i }, { replace: true }); },
          ok: function () {
            var nombres = sel.map(function (id) { return pnj(id).largo; }).join(', ');
            modal('¿Confirmáis la acusación?', '<p><b>Acusáis a:</b> ' + esc(nombres) + '.</p><p><b>Método:</b> ' + esc(caso().metodos[met]) + '.</p><p>No se puede deshacer.</p>', [
              { t: 'Confirmar', fn: function () { S.fin = { tipo: 'acusacion', acusados: sel, metodo: met, at: Date.now() }; autosave(); lsSet(LS_AUTO, null); go('final', {}, { reset: true }); } },
              { t: 'Cancelar', cls: 'secondary' }]);
          }
        });
      }
    };
  };

  function bloqueImplicado(resuelto) {
    var I = S.impl;
    if (!I || !I.jugando) return { html: '', pts: 0 };
    var html = '<h3>El Implicado</h3>', pts = 0;
    if (!I.hay) {
      html += '<p>No había ningún Implicado en esta partida.</p>';
    } else {
      html += whoInline(pj(I.implPj));
      if (I.testigoHablo && S.voto && S.voto.hecho) {
        var acierto = S.voto.a === I.implPj;
        pts = acierto ? 3 : -1;
        html += '<p>El Implicado era ' + esc(conArt(I.implPj)) + '. ' + (acierto ? 'Le descubristeis: +3 puntos.' : (S.voto.a === 'nadie' ? 'No acusasteis a nadie: −1 punto.' : 'Acusasteis a otro jugador: −1 punto.')) + '</p>';
        html += '<p><b>' + (resuelto && !acierto ? 'El Implicado gana: el caso se ha resuelto y nadie le ha descubierto.' : 'El Implicado pierde.') + '</b></p>';
      } else {
        html += '<p>El Implicado era ' + esc(conArt(I.implPj)) + '. El testigo no llegó a hablar: el token no entró en juego (0 puntos).</p>';
        html += '<p><b>' + (resuelto ? 'El Implicado gana: el caso se ha resuelto y nadie le ha descubierto.' : 'El Implicado pierde: el caso no se ha resuelto.') + '</b></p>';
      }
    }
    return { html: html, pts: pts };
  }

  SCREENS.final = function () {
    var F = S.fin, r = puntuar(F.acusados, F.metodo), imp = bloqueImplicado(r.resuelto);
    var epi = TX().epilogos[V()][r.epilogo] || TX().epilogos[V()].fallida;
    var html = (S.modoVar === 'oculta' ? effect('Habéis jugado la variante ' + V() + '.', 'info') : '');
    html += '<h3>La verdad</h3><div class="card verdad"><div class="say">' + verdadHtml(TX().verdad[V()]) + '</div></div>';
    html += '<h3>Epílogo</h3>' + card('', paras(epi));
    var total = r.pts + imp.pts;
    var desc = { total: r.metodo ? 'Todos los culpables y el método' : 'Todos los culpables, sin el método', parcial: r.metodo ? 'Acierto parcial, con el método' : 'Acierto parcial, sin el método', ninguno: r.metodo ? 'Solo el método' : 'Ningún culpable' }[r.tipo];
    html += '<h3>Puntuación</h3><div class="score"><div class="big">' + total + '</div><div class="lbl">puntos</div></div>';
    html += effect('Acusación: ' + desc + ' · ' + r.pts + ' puntos.', 'info');
    if (imp.pts) html += effect('Implicado: ' + (imp.pts > 0 ? '+' : '') + imp.pts + (Math.abs(imp.pts) === 1 ? ' punto.' : ' puntos.'), 'info');
    html += '<p class="center"><b>' + (r.resuelto ? 'Habéis resuelto el caso.' : 'El caso queda sin resolver.') + '</b></p>';
    html += imp.html + '<br>' + btn('Volver al inicio', 'inicio');
    return { title: 'Final', sub: 'Caso ' + caso().numero + ' · Variante ' + V(), lock: true, html: html, after: function (m) { bind(m, { inicio: function () { go('home', {}, { reset: true }); } }); } };
  };

  // ---- derrota
  function derrota() {
    S.fin = { tipo: 'derrota', at: Date.now() };
    lsSet(LS_AUTO, null);
    go('perdido', {}, { reset: true });
  }

  SCREENS.perdido = function () {
    var I = S.impl;
    var html = '<div class="pass" style="min-height:auto"><div class="big">La partida ha terminado.</div><p>Habéis perdido: 0 puntos.</p></div>';
    if (I && I.jugando) html += I.hay ? '<h3>El Implicado</h3>' + whoInline(pj(I.implPj)) + '<p>El Implicado era ' + esc(conArt(I.implPj)) + '.</p>' : '<h3>El Implicado</h3><p>No había ningún Implicado en esta partida.</p>';
    if (S.modoVar === 'oculta') {
      html += btn('Ver la verdad', 'ver') + btn('Guardar el misterio', 'guardar', 'secondary') +
        '<p class="small muted center">Si veis la verdad, ya conoceréis la solución de esta variante. Si guardáis el misterio, la próxima vez que elijáis este caso la app os propondrá jugar de nuevo esta misma variante, sin desvelaros cuál es.</p>';
    } else {
      html += btn('Ver la verdad', 'ver') + btn('Cerrar sin verla', 'cerrar', 'secondary');
    }
    return {
      title: 'Fin de la partida', lock: true, html: html, after: function (m) {
        bind(m, {
          ver: function () { go('verdad', {}, { replace: true }); },
          guardar: function () { var pend = lsGet(LS_PEND, {}); pend[S.caso] = { variante: S.variante, at: Date.now() }; lsSet(LS_PEND, pend); toast('Misterio guardado'); go('home', {}, { reset: true }); },
          cerrar: function () { go('home', {}, { reset: true }); }
        });
      }
    };
  };

  SCREENS.verdad = function () {
    var html = (S.modoVar === 'oculta' ? effect('Era la variante ' + V() + '.', 'info') : '') + '<div class="card verdad"><div class="say">' + verdadHtml(TX().verdad[V()]) + '</div></div>' + btn('Volver al inicio', 'inicio');
    return { title: 'La verdad', sub: 'Caso ' + caso().numero + ' · Variante ' + V(), lock: true, html: html, after: function (m) { bind(m, { inicio: function () { go('home', {}, { reset: true }); } }); } };
  };

  // ------------------------------------------------------------ arranque
  function init() {
    $('#bar-back').innerHTML = ICON.back;
    $('#bar-back').addEventListener('click', function () { back(); });
    try { history.replaceState({ bh: 0 }, ''); history.pushState({ bh: 1 }, ''); } catch (e) { }
    go('home', {}, { reset: true });
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }
  window.BH_DEBUG = { get S() { return S; }, puntuar: function (a, m) { return puntuar(a, m); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
