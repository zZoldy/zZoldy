// ===== Navegação mobile + Scrollspy + Simulador WhatsApp =====
document.addEventListener('DOMContentLoaded', () => {
  // Reordenar: mover a seção "sobre" para depois de "simulador"
  try {
    const sobre = document.getElementById('sobre');
    const simulador = document.getElementById('simulador');
    if (sobre && simulador && simulador.parentNode) {
      simulador.parentNode.insertBefore(sobre, simulador.nextSibling);
    }
  } catch (_) {}
  // --- Scrollspy: mantém seleção ativa na navegação
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = navAnchors
    .map(a => document.getElementById((a.getAttribute('href') || '').slice(1)))
    .filter(el => el && !el.classList.contains('overlay-panel'));

  let lockActiveUntil = 0; // impede que o scrollspy sobrescreva seleção durante rolagem suave

  function setActiveById(id){
    navAnchors.forEach(a => {
      const match = (a.getAttribute('href') || '') === `#${id}`;
      a.classList.toggle('active', match);
      if (match) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  }

  function refreshActive(){
    if (Date.now() < lockActiveUntil) return; // respeita seleção manual temporariamente
    if (!sections.length) return;
    const offsetVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-offset').trim();
    const offset = parseInt(offsetVar || '84', 10) || 84;
    const pos = window.scrollY + offset + 8;
    let currentId = sections[0].id;
    for (const sec of sections){ if (sec.offsetTop <= pos) currentId = sec.id; }
    setActiveById(currentId);
  }

  navAnchors.forEach(a => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    e.preventDefault();
    // Fecha qualquer overlay aberto antes de navegar para a âncora
    document.querySelectorAll('.overlay-panel.open').forEach(p => {
      p.classList.remove('open');
      p.setAttribute('aria-hidden','true');
    });
    document.body.style.overflow = '';
    const id = href.slice(1);
    const targetEl = document.getElementById(id);
    if (id) setActiveById(id);
    lockActiveUntil = Date.now() + 1200; // trava ~1.2s durante a animação
    if (targetEl) {
      const offsetVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-offset').trim();
      const navOffset = parseInt(offsetVar || '84', 10) || 84;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } else {
      // fallback
      location.hash = href;
    }
  }));
  window.addEventListener('scroll', refreshActive, { passive: true });
  refreshActive();

  // ===== Overlays (Benefícios / Simular) =====
  function openOverlay(id){
    const panel = document.getElementById(id);
    if (!panel) return;
    // Fechar qualquer outro overlay aberto antes de abrir o novo
    document.querySelectorAll('.overlay-panel.open').forEach(p => {
      if (p.id !== id) {
        p.classList.remove('open');
        p.setAttribute('aria-hidden','true');
      }
    });
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeOverlay(id){
    const panel = document.getElementById(id);
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  // Close with backdrop click or [x]
  document.querySelectorAll('.overlay-panel').forEach(panel => {
    panel.addEventListener('click', (ev) => {
      const box = panel.querySelector('.overlay-box');
      const isClose = ev.target.closest('[data-overlay-close]');
      const outside = !ev.target.closest('.overlay-box');
      if (isClose || outside) closeOverlay(panel.id);
    });
  });
  // Esc closes
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape'){
      document.querySelectorAll('.overlay-panel.open').forEach(p => closeOverlay(p.id));
    }
  });
  // Intercept only if target section is an overlay panel; otherwise let normal scroll happen
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href="#beneficios"], a[href="#simulador"], a[href="#sobre"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const id = href.slice(1);
    const panel = document.getElementById(id);
    if (panel && panel.classList.contains('overlay-panel')){
      ev.preventDefault(); ev.stopPropagation();
      setActiveById(id);
      openOverlay(id);
    }
  }, true);

  // --- Menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const opened = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // Promo cards: WhatsApp interest on "Solicite uma proposta"
  (function initPromoWhatsApp(){
    const number = '5561986644528';
    const buttons = document.querySelectorAll('.promo-card .btn-light');
    if (!buttons.length) return;
    const labelFromId = (id) => id === 'card-veiculo' ? 'Veículo' : id === 'card-caminhao' ? 'Caminhão' : 'Imóvel';
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('article');
        const tipo = labelFromId(card?.id || '');
        const msg = `Olá! Tenho interesse na oferta de ${tipo} e gostaria de solicitar uma proposta.`;
        const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      });
    });
  })();

  // (revertido) Slider de promo-cards removido

  // Ao clicar em "Contato": rolar para o topo da seção (considerando a nav fixa)
  const contatoLinks = Array.from(document.querySelectorAll('a[href="#contato"]')).filter(a => !a.closest('.nav'));
  if (contatoLinks.length) {
    const onClickContato = (e) => {
      e.preventDefault();
      const section = document.getElementById('contato');
      if (!section) return;

      const offsetVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-offset').trim();
      const navOffset = parseInt(offsetVar || '84', 10) || 84;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const target = Math.max(0, sectionTop - navOffset);
      window.scrollTo({ top: target, behavior: 'smooth' });
    };
    contatoLinks.forEach(a => a.addEventListener('click', onClickContato));
  }

  // Slider do HERO: alterna imagens de veículos
  (function initHeroSlider(){
    const elImg = document.getElementById('hero-slide');
    const dotsWrap = document.querySelector('.hero-dots');
    if (!elImg || !dotsWrap) return;

        const candidates = [
  { src: "assets/view_1.png", alt: "View 1" },
  { src: "assets/view_2.png", alt: "View 2" },
  { src: "assets/view_3.png", alt: "View 3" },
  { src: "assets/view_4.png", alt: "View 4" },
  { src: "assets/view_5.png", alt: "View 5" },
  { src: "assets/view_6.png", alt: "View 6" },
];

    let pending = candidates.length; const loaded = [];
    function done(){ if(--pending===0) start(loaded.length?loaded:candidates); }
    candidates.forEach(item=>{ const img=new Image(); img.onload=()=>{loaded.push(item);done()}; img.onerror=done; img.src=item.src; });

    let idx=0, timer=null, list=candidates;
    function show(i){ idx=i%list.length; if(idx<0) idx=list.length-1; elImg.src=list[idx].src; elImg.alt=list[idx].alt; updateDots(); }
    function updateDots(){ const dots=[...dotsWrap.querySelectorAll('button')]; dots.forEach((d,k)=>d.classList.toggle('active',k===idx)); }
    function resetTimer(){ if(timer) clearInterval(timer); timer=setInterval(()=>show((idx+1)%list.length), 4000); }

    function start(arr){ list=arr; dotsWrap.innerHTML=''; list.forEach((_,i)=>{ const b=document.createElement('button'); if(i===0)b.classList.add('active'); b.addEventListener('click',()=>{ show(i); resetTimer(); }); dotsWrap.appendChild(b); }); show(0); resetTimer(); }
  })();

  // Slider de produtos (carros/casas/caminhões) nos promo-cards
  (function initProductSlider(){
    const slider = document.querySelector('.prod-slider');
    const track  = document.querySelector('.prod-track');
    const dotsWrap = document.querySelector('.prod-dots');
    const prev = document.querySelector('.prod-prev');
    const next = document.querySelector('.prod-next');
    if (!slider || !track || !dotsWrap) return;

    const slides = Array.from(track.querySelectorAll('.prod-slide'));
    if (!slides.length) return;

    let idx = slides.findIndex(s => s.classList.contains('active'));
    if (idx < 0) idx = 0;

    function show(i){
      idx = (i % slides.length + slides.length) % slides.length;
      slides.forEach((s,k) => s.classList.toggle('active', k === idx));
      const dots = Array.from(dotsWrap.querySelectorAll('button'));
      dots.forEach((d,k) => d.classList.toggle('active', k === idx));
    }
    function buildDots(){
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        if (i === idx) b.classList.add('active');
        b.addEventListener('click', () => show(i));
        dotsWrap.appendChild(b);
      });
    }

    prev?.addEventListener('click', () => show(idx - 1));
    next?.addEventListener('click', () => show(idx + 1));
    buildDots();
    show(idx);

    // autoplay com pausa no hover
    let timer = setInterval(() => show(idx + 1), 4500);
    slider.addEventListener('mouseenter', () => { clearInterval(timer); });
    slider.addEventListener('mouseleave', () => { timer = setInterval(() => show(idx + 1), 4500); });
  })();

  // Depoimentos: alterna automaticamente
  const card = document.querySelector('.testimonial-card');
  if (card) {
    const items = Array.from(card.querySelectorAll('.testimonial-items blockquote'));
    const dotsWrap = card.querySelector('.testimonial-dots');
    let idx = items.findIndex(el => el.classList.contains('active'));
    if (idx < 0) idx = 0;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      items.forEach((_, i) => {
        const b = document.createElement('button');
        if (i === idx) b.classList.add('active');
        b.addEventListener('click', () => show(i));
        dotsWrap.appendChild(b);
      });
    }

    function show(i){
      items.forEach((el, k) => el.classList.toggle('active', k === i));
      const dots = Array.from(card.querySelectorAll('.testimonial-dots button'));
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
      idx = i;
    }

    setInterval(() => show((idx + 1) % items.length), 4500);
  }

  // Slider por card (promo-media)
  (function initCardMediaSliders(){
    const sliders = Array.from(document.querySelectorAll('.promo-card .media-slider'));
    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const track  = slider.querySelector('.media-track');
      const dotsWrap = slider.querySelector('.media-dots');
      const prev = slider.querySelector('.media-prev');
      const next = slider.querySelector('.media-next');
      if (!track || !dotsWrap) return;

      // Descobre o tipo do card para montar imagens padrão
      function getType(sl){
        const card = sl.closest('.promo-card');
        const prefix = card?.dataset?.mediaPrefix;
        if (prefix){
          const mapAlt = { carro: 'Carro', casa: 'Casa', caminhao: 'Caminhão' };
          return { key: prefix, alt: mapAlt[prefix] || prefix };
        }
        const id = card?.id || '';
        if (id === 'card-veiculo') return { key: 'carro', alt: 'Carro' };
        if (id === 'card-imovel')  return { key: 'casa',  alt: 'Casa'  };
        if (id === 'card-caminhao')return { key: 'caminhao', alt: 'Caminhão' };
        return null;
      }

      async function tryBuildFromPattern(){
        const info = getType(slider);
        if (!info) return [];
        const exts = ['png','jpg','jpeg','webp'];
        const maxN = 6;
        const found = [];

        function preload(src){
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok:true, src });
            img.onerror = () => resolve({ ok:false });
            img.src = src;
          });
        }

        for (let i=1; i<=maxN; i++){
          let hit = null;
          for (const ext of exts){
            const path = `assets/${info.key}_${i}.${ext}`;
            // eslint-disable-next-line no-await-in-loop
            const res = await preload(path);
            if (res.ok){ hit = { src: path, alt: info.alt + ' ' + i }; break; }
          }
          if (hit) found.push(hit);
        }
        return found;
      }

      function setSlides(list){
        track.innerHTML = '';
        list.forEach((it, i) => {
          const wrap = document.createElement('div');
          wrap.className = 'media-slide' + (i === 0 ? ' active' : '');
          const img = document.createElement('img');
          img.src = it.src; img.alt = it.alt || '';
          wrap.appendChild(img);
          track.appendChild(wrap);
        });
      }

      let slides = Array.from(track.querySelectorAll('.media-slide'));
      let idx = slides.findIndex(s => s.classList.contains('active'));
      if (idx < 0) idx = 0;

      // Se só há uma ou nenhuma imagem, tenta carregar padrão carro_1/casa_1/caminhao_1...
      (async () => {
        // Tenta carregar imagens por padrão (carro_N/casa_N/caminhao_N)
        const found = await tryBuildFromPattern();

        if (slides.length === 0 && found.length){
          // Sem imagens no HTML: usa apenas as encontradas por padrão
          setSlides(found);
          slides = Array.from(track.querySelectorAll('.media-slide'));
          idx = 0;
        } else if (found.length){
          // Se já há imagens, acrescenta as do padrão que não existem ainda
          const existing = new Set(slides.map(s => (s.querySelector('img')?.src || '').toLowerCase()));
          const toAppend = found.filter(it => !existing.has(it.src.toLowerCase()));
          if (toAppend.length){
            const current = slides.map(s => ({ src: s.querySelector('img')?.src || '', alt: s.querySelector('img')?.alt || '' }));
            setSlides([...current, ...toAppend]);
            slides = Array.from(track.querySelectorAll('.media-slide'));
          }
        }

        buildDots();
        show(idx);
        attachAutoplay();
      })();

      function show(i){
        idx = (i % slides.length + slides.length) % slides.length;
        slides.forEach((s,k) => s.classList.toggle('active', k === idx));
        const dots = Array.from(dotsWrap.querySelectorAll('button'));
        dots.forEach((d,k) => d.classList.toggle('active', k === idx));
      }
      function buildDots(){
        dotsWrap.innerHTML = '';
        slides.forEach((_, i) => {
          const b = document.createElement('button');
          if (i === idx) b.classList.add('active');
          b.addEventListener('click', () => show(i));
          dotsWrap.appendChild(b);
        });
      }

      if (prev) prev.addEventListener('click', () => show(idx - 1));
      if (next) next.addEventListener('click', () => show(idx + 1));

      function attachAutoplay(){
        // Oculta controles quando só há uma imagem
        slides = Array.from(track.querySelectorAll('.media-slide'));
        if (slides.length <= 1){
          if (prev) prev.style.display = 'none';
          if (next) next.style.display = 'none';
          dotsWrap.style.display = 'none';
          return;
        }
        let timer = setInterval(() => show(idx + 1), 5000);
        slider.addEventListener('mouseenter', () => clearInterval(timer));
        slider.addEventListener('mouseleave', () => { timer = setInterval(() => show(idx + 1), 5000); });
      }
    });
  })();

  // --- Máscara de moeda (BRL) no campo valor
  const el  = (id) => document.getElementById(id);
  const valorInput = el('valor');

  function formatBRLFromDigits(digitsStr){
    const cents = parseInt(digitsStr || '0', 10) || 0;
    const value = cents / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function maskCurrencyInput(e){
    const input = e.target;
    const digits = (input.value || '').replace(/\D/g, '');
    input.value = formatBRLFromDigits(digits);
  }

  if (valorInput) {
    // Inicializa formato caso o valor não esteja no padrão
    maskCurrencyInput({ target: valorInput });
    valorInput.addEventListener('input', maskCurrencyInput);
    valorInput.addEventListener('blur', maskCurrencyInput);
    valorInput.addEventListener('paste', () => {
      // pequena pausa para deixar o conteúdo colar e então formatar
      setTimeout(()=>maskCurrencyInput({ target: valorInput }), 0);
    });
  }

  // Dinâmica nos promo-cards ao rolar (parallax sutil)
  (function initPromoMotion(){
    const cards = Array.from(document.querySelectorAll('.promo-card'));
    if (!cards.length) return;

    let ticking = false;
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    function update(){
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const mid = vh / 2;
      for (const card of cards){
        const r = card.getBoundingClientRect();
        const center = r.top + r.height/2;
        const dist = clamp((center - mid) / mid, -1, 1); // -1..1
        const dir = card.classList.contains('reverse') ? -1 : 1;
        const ty = clamp(-dist * 14, -18, 18); // px
        const tx = clamp(dir * dist * 9, -14, 14); // px
        const scale = clamp(1 - Math.abs(dist) * 0.035, 0.96, 1);
        card.style.setProperty('--promo-ty', ty.toFixed(2) + 'px');
        card.style.setProperty('--promo-tx', tx.toFixed(2) + 'px');
        card.style.setProperty('--promo-scale', scale.toFixed(3));
      }
    }

    function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // --- Simulador -> abrir WhatsApp com mensagem preenchida
  const btn = el('btn-simular');

  if (btn) {
    btn.addEventListener('click', () => {
      const tipoEl    = el('tipo');
      const tipoValue = (tipoEl?.value || '').trim();
      const tipoLabel = (tipoEl?.options?.[tipoEl.selectedIndex]?.text || tipoValue).trim();
      // Converte "R$ 120.000,00" -> 120000.00
      const rawValor = (el('valor')?.value || '');
      const digits   = rawValor.replace(/\D/g, '');
      const valor    = (parseInt(digits || '0', 10) || 0) / 100;
      const prazo = Number(el('prazo')?.value || 0);
      const nome  = (el('nome')?.value || '').trim();

      if (!valor || !prazo || !tipoValue) {
        alert('Preencha Tipo, Valor e Prazo para simular.');
        return;
      }

      const brl = new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL'
      }).format(valor);

      const linhas = [
        'Olá! Gostaria de simular.',
        `Tipo: ${tipoLabel}`,
        `Valor da carta: ${brl}`,
        `Prazo: ${prazo} meses`,
        nome ? `Nome: ${nome}` : null
      ].filter(Boolean);

      const texto = encodeURIComponent(linhas.join('\n'));
      window.open(`https://wa.me/5561986644528?text=${texto}`, '_blank');
    });
  }

  // Ícone dinâmico no select de Tipo (carro/casa)
  const tipoSelect = el('tipo');
  const tipoIcon   = document.querySelector('.select-field i');
  function updateTipoIconFixed(){
    if (!tipoSelect || !tipoIcon) return;
    const v = (tipoSelect.value || '').toLowerCase();
    if (v === 'imovel') {
      tipoIcon.classList.remove('fa-car-side');
      tipoIcon.classList.add('fa-house');
    } else {
      tipoIcon.classList.remove('fa-house');
      tipoIcon.classList.add('fa-car-side');
    }
  }
  if (tipoSelect) {
    updateTipoIconFixed();
    tipoSelect.addEventListener('change', updateTipoIconFixed);
  }
});

// ===== Contato -> abre o cliente de e-mail com assunto/corpo prontos =====
function enviarEmail() {
  const get = (id) => document.getElementById(id);

  const nome       = (get('nomeContato')?.value || get('nome')?.value || '').trim();
  const telefone   = (get('telefone')?.value || '').trim();
  const emailCli   = (get('emailCliente')?.value || '').trim();
  const mensagem   = (get('mensagem')?.value || '').trim();

  if (!nome || !telefone || !mensagem) {
    alert('Preencha Nome, Telefone e Mensagem.');
    return;
  }

  const to      = 'rsintermediacoesltda@gmail.com';
  const subject = encodeURIComponent('Contato pelo site — R&S Intermediações');
  const body    = encodeURIComponent(
    `Nome: ${nome}\nTelefone: ${telefone}\nE-mail: ${emailCli}\n\nMensagem:\n${mensagem}`
  );

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

// Override: melhorar formatação do e-mail do contato
function enviarEmail() {
  const get = (id) => document.getElementById(id);

  const nome     = (get('nomeContato')?.value || get('nome')?.value || '').trim();
  const telefone = (get('telefone')?.value || '').trim();
  const emailCli = (get('emailCliente')?.value || '').trim();
  const mensagem = (get('mensagem')?.value || '').trim();

  if (!nome || !telefone || !mensagem) {
    alert('Preencha Nome, Telefone e Mensagem.');
    return;
  }

  const endpoint = 'https://formsubmit.co/ajax/' + encodeURIComponent('filipekk41@gmail.com');
  const payload = {
    _subject: 'Novo contato - R&S Intermediacoes',
    _template: 'table',
    _captcha: 'false',
    Nome: nome,
    Telefone: telefone,
    Email: emailCli,
    Mensagem: mensagem,
  };

  const form = document.getElementById('rs-form');
  const btn  = form?.querySelector('button[type="submit"]');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = 'Enviando...'; }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => { if (!res.ok) throw res; return res.json(); })
    .then(() => { alert('Mensagem enviada com sucesso!'); if (form) form.reset(); })
    .catch(async (err) => {
      let msg = 'Falha no envio. Tente novamente.';
      try { const j = await err.json(); if (j?.message) msg = 'Erro: ' + j.message; } catch(_){}
      alert(msg);
    })
    .finally(() => { if (btn) { btn.disabled = false; btn.innerHTML = originalHtml; } });
}


