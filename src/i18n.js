/*!
 * The two languages of the five pages. English is written in each page's
 * HTML (Manchester, pounds); Portuguese (pt-PT, euros) is in /<page>.pt.js
 * for the page's own words and here for the words every page shares (the
 * demo bar, the style switcher, the forms, the booking widget). Elements
 * carry data-i18n="key" (their content) and data-i18n-attr="attr=key,…"
 * (attributes); the English is read from the page before the first switch,
 * so it is written once.
 *
 * Every business on these pages is invented. The address, phone and hours
 * are the demo account's (Maré Hair & Beauty (Demo), Manchester), shared by
 * all four styles; the phone number is in Ofcom's drama range.
 */
(function () {
  'use strict';

  // Words every page shares.
  var PT = {
    'c.skip': 'Saltar para a marcação',
    'c.demoText': 'Site de demonstração da Autisync para um negócio inventado: as marcações e os pedidos entram na conta de demonstração do CRM.',
    'c.demoCta': 'Quero um site assim →',
    'c.demoHref': 'https://www.autisync.com/pt/marcar',
    'c.swLabel': 'Ver como', 'c.swAll': 'Os quatro', 'c.swPick': 'Ir para', 'c.swAllLabel': 'Ver os quatro estilos',
    'c.swSalon': 'Salão', 'c.swBarber': 'Barbearia', 'c.swNails': 'Unhas', 'c.swTattoo': 'Tatuagem',
    'c.swNav': 'Mudar de estilo', 'c.langLabel': 'Idioma',
    'c.menu': 'Menu', 'c.close': 'Fechar',
    'c.bookNote': 'Nesta demonstração, os quatro estilos marcam na mesma agenda de demonstração, por isso a lista mostra os serviços de cabelo e beleza do Maré.',
    'c.fName': 'Nome', 'c.fMobile': 'Telemóvel', 'c.fEmail': 'Email', 'c.fMessage': 'A sua mensagem', 'c.fSend': 'Enviar mensagem',
    'c.fInterest': 'Tem interesse em', 'c.fDate': 'Data (se já tiver)', 'c.fOptional': 'opcional',
    'c.mon': 'Segunda', 'c.tue': 'Terça', 'c.wed': 'Quarta', 'c.thu': 'Quinta', 'c.fri': 'Sexta', 'c.sat': 'Sábado', 'c.sun': 'Domingo',
    'c.monFri': 'Segunda a sexta', 'c.h9to7': '9h00 às 19h00', 'c.h9to5': '9h00 às 17h00', 'c.closed': 'Fechado',
    'c.hoursShort': 'Seg. a sex. 9h00–19h00 · Sáb. 9h00–17h00 · Dom. fechado',
    'c.where': 'Onde', 'c.hours': 'Horário', 'c.call': 'Telefone', 'c.write': 'Email',
    'c.demoDetails': 'Morada, telefone e horário da conta de demonstração, iguais nos quatro estilos.',
    'c.footDemo': 'Site de demonstração de um negócio inventado, feito pela <a href="https://www.autisync.com/pt" target="_blank" rel="noopener">Autisync</a>. As marcações e as mensagens entram no CRM de demonstração.',
    'c.footTop': 'Voltar ao topo',
    'c.sampleReviews': 'Avaliações inventadas, para a demonstração',
  };

  // Words the scripts use.
  var JS = {
    en: {
      zoneOpen: 'Europe/London',
      openNow: function (until) { return 'Open now, until ' + until; },
      opensAt: function (when, at) { return 'Closed now. Opens ' + when + ' at ' + at; },
      today: 'today', tomorrow: 'tomorrow',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hhmm: function (hm) { var h = +hm.slice(0, 2), m = hm.slice(3); return (h % 12 || 12) + (m === '00' ? '' : ':' + m) + (h < 12 ? 'am' : 'pm'); },
      withStaff: function (n) { return 'with ' + n; },
      needName: 'Please add your name.', badEmail: 'That email address doesn\'t look right.', sending: 'Sending…', needAge: 'Please confirm you\'re 18 or over.',
      thanks: 'Thank you. It\'s in the demo CRM now, and on a real site we\'d reply today.',
      failed: 'That didn\'t send from this preview. On the live site it goes straight into the CRM.',
      number: 'en-GB',
      booking: {
        steps: ['Service', 'Day and time', 'Your details', 'Confirm'],
        notesPh: 'Anything we should know: a patch test you\'ve had, a reference photo, access.',
        powered: 'Booked straight into the Maré demo diary',
        zone: 'UK time', locale: 'en-GB', hour12: true,
        offlineTitle: 'The live diary opens on the real site',
        offlineText: 'This preview can\'t reach the demo diary. The same booking runs on the CRM\'s own booking page, so you can try it there.',
        offlineBtn: 'Open the booking page',
      },
    },
    pt: {
      zoneOpen: 'Europe/London',
      openNow: function (until) { return 'Aberto agora, até às ' + until; },
      opensAt: function (when, at) { return 'Fechado agora. Abre ' + when + ' às ' + at; },
      today: 'hoje', tomorrow: 'amanhã',
      days: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
      hhmm: function (hm) { var h = +hm.slice(0, 2), m = hm.slice(3); return h + 'h' + m; },
      withStaff: function (n) { return 'com ' + n; },
      needName: 'Indique o seu nome, por favor.', badEmail: 'Esse email não parece estar certo.', sending: 'A enviar…', needAge: 'Confirme que tem 18 anos ou mais, por favor.',
      thanks: 'Obrigado. A mensagem já está no CRM de demonstração; num site real, respondíamos hoje.',
      failed: 'Não foi possível enviar a partir desta pré-visualização. No site real, entra diretamente no CRM.',
      number: 'pt-PT',
      booking: {
        steps: ['Serviço', 'Dia e hora', 'Os seus dados', 'Confirmar'],
        loading: 'A carregar a agenda…',
        down: 'Não conseguimos abrir a agenda agora. Por favor, ligue-nos.',
        free: 'Grátis', whoWith: 'Com quem?', anyone: 'Primeiro disponível', chooseTime: 'Escolher hora',
        earlier: 'Dias anteriores', later: 'Dias seguintes',
        closed: 'Fechado', full: 'Cheio', today: 'Hoje', tomorrow: 'Amanhã',
        freeN: function (n) { return n + (n === 1 ? ' vaga' : ' vagas'); },
        pickDay: 'Escolha um dia para ver as horas livres.',
        noTimes: 'Não há vagas neste dia. Experimente o seguinte.',
        zone: 'hora do Reino Unido', locale: 'pt-PT', hour12: false,
        dayShort: function (d) { return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d]; },
        cont: 'Continuar', back: 'Voltar',
        name: 'O seu nome', email: 'Email', phone: 'Telemóvel', optional: 'opcional',
        notes: 'Algo que devamos saber?', notesPh: 'Um teste de alergia que já fez, uma foto de referência, acessos.',
        review: 'Rever e confirmar', needName: 'Indique o seu nome, por favor.', needEmail: 'Esse email não parece estar certo.', needPhone: 'Indique um telemóvel para o podermos contactar no dia.',
        summary: 'A sua marcação', what: 'Serviço', when: 'Quando', with: 'Com', who: 'Nome', mail: 'Email', price: 'Preço',
        payOnDay: 'Pago no dia',
        payOnline: 'Este serviço tem um sinal a pagar online. Termina a marcação na nossa página segura.',
        payBtn: 'Continuar para pagamento',
        confirm: 'Confirmar marcação', sending: 'A marcar…',
        doneTitle: 'Está marcado.',
        doneText: function (e) { return 'Enviámos a confirmação para ' + e + ', com um link para alterar ou cancelar. Na véspera recebe um lembrete.'; },
        another: 'Marcar outro serviço',
        taken: 'Alguém acabou de marcar essa hora. Escolha outra, por favor.',
        powered: 'Marcado diretamente na agenda de demonstração do Maré',
        bookedOn: 'Marcado em ',
        withName: function (n) { return 'com ' + n; },
        when2: function (day, time) { return day + ' às ' + time; },
        mins: function (m) { return m % 60 === 0 ? (m / 60) + (m === 60 ? ' hora' : ' horas') : m > 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; },
        offlineTitle: 'A agenda ao vivo abre no site real',
        offlineText: 'Esta pré-visualização não consegue ligar-se à agenda de demonstração. A mesma marcação funciona na página de marcações do CRM, onde a pode experimentar.',
        offlineBtn: 'Abrir a página de marcações',
      },
    },
  };

  // The CRM's services (the Maré demo diary) as the pages show them. The CRM
  // keeps one name per service, in English; English prices come from the CRM.
  var SERVICES = [
    { names: ['Cut and finish'], pt: { name: 'Corte e brushing', description: 'Consulta, lavagem, corte e brushing.', price: '65 €' } },
    { names: ['Full colour'], pt: { name: 'Coloração completa', description: 'Da raiz às pontas, com tonalizante e acabamento. Teste de alergia 48 horas antes.', price: '110 €' } },
    { names: ['Balayage'], pt: { name: 'Balayage', description: 'Madeixas pintadas à mão, tonalizante, corte e acabamento.', price: '185 €' } },
    { names: ['Brow lamination and tint'], pt: { name: 'Laminação e coloração de sobrancelhas', description: 'Design, laminação e coloração. Teste de alergia 48 horas antes.', price: '55 €' } },
    { names: ['Lash lift and tint'], pt: { name: 'Lifting e coloração de pestanas', description: 'Dura seis a oito semanas.', price: '60 €' } },
    { names: ['Patch test'], pt: { name: 'Teste de alergia', description: 'Obrigatório 48 horas antes de qualquer coloração.', price: null } },
  ];

  var originals = new Map();
  function remember(el) {
    if (originals.has(el)) return originals.get(el);
    var o = { html: el.hasAttribute('data-i18n') ? el.innerHTML : null, attrs: {} };
    var spec = el.getAttribute('data-i18n-attr');
    if (spec) spec.split(',').forEach(function (pair) { var a = pair.split('=')[0].trim(); o.attrs[a] = el.getAttribute(a); });
    originals.set(el, o);
    return o;
  }
  var head = null;
  function snapshot() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n],[data-i18n-attr]'), remember);
    if (!head) {
      var md = document.querySelector('meta[name="description"]'), ot = document.querySelector('meta[property="og:title"]'), od = document.querySelector('meta[property="og:description"]');
      head = { title: document.title, description: md && md.content, ogTitle: ot && ot.content, ogDescription: od && od.content };
    }
  }

  function applyLang(lang) {
    lang = lang === 'pt' ? 'pt' : 'en';
    snapshot();
    var root = document.documentElement, pt = lang === 'pt';
    root.setAttribute('data-lang', lang);
    root.lang = pt ? 'pt-PT' : 'en-GB';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var o = remember(el), v = pt ? PT[el.getAttribute('data-i18n')] : null;
      var next = v != null ? v : o.html;
      if (el.innerHTML !== next) el.innerHTML = next;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (el) {
      var o = remember(el);
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var p = pair.split('='), attr = p[0].trim(), key = (p[1] || '').trim();
        var v = pt ? PT[key] : null;
        if (v != null) el.setAttribute(attr, v); else if (o.attrs[attr] != null) el.setAttribute(attr, o.attrs[attr]);
      });
    });
    var meta = function (sel, v) { var m = document.querySelector(sel); if (m && v != null) m.setAttribute('content', v); };
    document.title = pt && PT._title ? PT._title : head.title;
    meta('meta[name="description"]', pt && PT._description ? PT._description : head.description);
    meta('meta[property="og:title"]', pt && PT._title ? PT._title : head.ogTitle);
    meta('meta[property="og:description"]', pt && PT._ogDescription ? PT._ogDescription : head.ogDescription);
    Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
    // Links to the other styles keep the language.
    var navPt = /^pt\b/i.test(navigator.language || '');
    Array.prototype.forEach.call(document.querySelectorAll('a[data-keep-lang]'), function (a) {
      var base = a.getAttribute('data-keep-lang') || a.getAttribute('href').split('?')[0];
      a.setAttribute('data-keep-lang', base);
      a.setAttribute('href', base + (pt ? '?lang=pt' : navPt ? '?lang=en' : ''));
    });
    try { localStorage.setItem('mare-demo-lang', lang); } catch (e) { /* private mode */ }
    root.setAttribute('data-i18n-ready', '');
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } })); } catch (e) { /* old browsers */ }
  }

  window.I18N = {
    pt: PT, js: JS, services: SERVICES, apply: applyLang, snapshot: snapshot,
    add: function (dict) { for (var k in dict) if (Object.prototype.hasOwnProperty.call(dict, k)) PT[k] = dict[k]; },
    addJS: function (en, pt) { var k; for (k in en || {}) JS.en[k] = en[k]; for (k in pt || {}) JS.pt[k] = pt[k]; },
    lang: function () { return document.documentElement.getAttribute('data-lang') === 'pt' ? 'pt' : 'en'; },
  };
})();
