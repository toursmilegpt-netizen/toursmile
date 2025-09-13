(function () {
  const API_BASE = (window.NEXT_PUBLIC_API_BASE || 'https://api.toursmile.in/api').replace(/\/+$/,'');
  const POPULAR = [
    { city:'Pune', airport:'Pune Intl', iata:'PNQ', country:'IN' },
    { city:'Mumbai', airport:'Chhatrapati Shivaji Maharaj Intl', iata:'BOM', country:'IN' },
    { city:'Delhi', airport:'Indira Gandhi Intl', iata:'DEL', country:'IN' },
    { city:'Bengaluru', airport:'Kempegowda Intl', iata:'BLR', country:'IN' },
  ];
  const FALLBACK = [
    { city:'Hyderabad', airport:'Rajiv Gandhi Intl', iata:'HYD', country:'IN' },
    { city:'Chennai', airport:'Chennai Intl', iata:'MAA', country:'IN' },
    { city:'Kolkata', airport:'Netaji Subhash Chandra Bose Intl', iata:'CCU', country:'IN' },
    { city:'Goa', airport:'Manohar Intl', iata:'GOX', country:'IN' },
    { city:'Ahmedabad', airport:'Sardar Vallabhbhai Patel Intl', iata:'AMD', country:'IN' },
  ];
  const REC_KEY = 'ts_recent_airports_v1';

  function loadRecents() { try { return JSON.parse(localStorage.getItem(REC_KEY) || '[]'); } catch { return []; } }
  function saveRecent(item) {
    const rec = loadRecents().filter(x => x.iata !== item.iata);
    rec.unshift(item);
    localStorage.setItem(REC_KEY, JSON.stringify(rec.slice(0, 6)));
  }
  function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }

  function renderSection(title, list, onPick){
    if(!list || !list.length) return null;
    const sec = el('div','ts-dd-sec');
    if(title) sec.appendChild(el('div','ts-dd-title', title));
    list.forEach(item => {
      const row = el('div','ts-dd-item'); row.setAttribute('role','option');
      const left = el('div');
      left.appendChild(el('div','ts-city', `${item.city} — ${item.iata}`));
      left.appendChild(el('div','ts-sub', item.airport));
      const code = el('div','ts-code', item.iata);
      row.appendChild(left); row.appendChild(code);
      row.addEventListener('click', () => onPick(item));
      sec.appendChild(row);
    });
    return sec;
  }

  function highlight(list, q) {
    if(!q) return list;
    const re = new RegExp(`(${q})`,'ig');
    return list.map(it => ({
      ...it,
      city: it.city.replace(re,'<mark>$1</mark>'),
      airport: it.airport.replace(re,'<mark>$1</mark>'),
      iata: it.iata.replace(re,'<mark>$1</mark>')
    }));
  }

  function createAutocomplete(input, opts) {
    let dd, selIndex = -1, itemsFlat = [], aborter = null, lastQuery = '';
    input.setAttribute('autocomplete','off');
    input.setAttribute('role','combobox');
    input.setAttribute('aria-expanded','false');
    input.classList.add('ts-input');

    const wrap = input.closest('.ts-field') || (function(){ const w = el('div','ts-field'); input.parentNode.insertBefore(w, input); w.appendChild(input); return w; })();

    const clearBtn = el('div','ts-clear','✕');
    wrap.appendChild(clearBtn);
    clearBtn.addEventListener('click', () => { input.value=''; input.dataset.iata=''; input.focus(); showDropdown(); validate(); });

    function close() { if(dd){ dd.remove(); dd=null; input.setAttribute('aria-expanded','false'); } selIndex = -1; itemsFlat=[]; }
    function pick(item, fromKeyboard=false) {
      input.value = `${item.city.replace(/<[^>]+>/g,'')} — ${item.iata.replace(/<[^>]+>/g,'')}`;
      input.dataset.iata = item.iata.replace(/<[^>]+>/g,'');
      saveRecent({ city:item.city.replace(/<[^>]+>/g,''), airport:item.airport.replace(/<[^>]+>/g,''), iata:item.iata.replace(/<[^>]+>/g,''), country:item.country});
      close(); validate(); if(opts && opts.onPick) opts.onPick(item, fromKeyboard);
    }
    function showDropdown(list) {
      if(dd) dd.remove();
      dd = el('div','ts-dd'); dd.setAttribute('role','listbox');
      const q = input.value.trim();
      const recents = loadRecents();
      const pop = POPULAR;
      let matches = list;

      if(!matches) {
        if(q.length < 2) {
          itemsFlat = [];
          const s1 = renderSection('Popular', pop, pick);
          const s2 = renderSection(recents.length?'Recent':'', recents, pick);
          if(s1) dd.appendChild(s1);
          if(s2) dd.appendChild(s2);
          wrap.appendChild(dd); input.setAttribute('aria-expanded','true'); return;
        }
      }

      if(matches && matches.length) {
        itemsFlat = matches.map(m => ({...m, __type:'match'}));
        const s3 = renderSection('Matches', highlight(matches, q), pick);
        if(s3) dd.appendChild(s3);
      } else {
        itemsFlat = [];
        dd.appendChild(el('div','ts-dd-sec', `<div class="ts-dd-title">No matches found</div>`));
      }
      wrap.appendChild(dd); input.setAttribute('aria-expanded','true');
    }

    async function queryAirports(q, limit = 10) {
      if(aborter) aborter.abort();
      aborter = new AbortController();
      try {
        const url = `${API_BASE}/airports/search?query=${encodeURIComponent(q)}&limit=${limit}`;
        const res = await fetch(url, { signal: aborter.signal, headers: { 'Content-Type':'application/json', 'X-Session-Id': (window.localStorage.getItem('ts_session') || 'web') }});
        if(!res.ok) throw new Error('bad status');
        const data = await res.json();
        return Array.isArray(data.results) ? data.results : [];
      } catch (e) {
        // fallback filter
        const all = [...POPULAR, ...FALLBACK];
        return all.filter(x => (x.city+x.iata+x.airport).toLowerCase().includes(q.toLowerCase())).slice(0, limit);
      }
    }

    function validate() { if(opts && opts.onChange) opts.onChange(); }

    input.addEventListener('focus', () => showDropdown());
    input.addEventListener('input', () => {
      const q = input.value.trim();
      input.dataset.iata = '';
      if(q.length < 2) { showDropdown(); return; }
      if(q === lastQuery) return;
      lastQuery = q;
      clearTimeout(input.__deb);
      input.__deb = setTimeout(async () => {
        const results = await queryAirports(q, 10);
        showDropdown(results);
      }, 260);
    });
    input.addEventListener('keydown', (e) => {
      if(!dd) return;
      const optsEls = dd.querySelectorAll('.ts-dd-item');
      if(['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)) e.preventDefault();
      if(e.key === 'ArrowDown') { selIndex = Math.min(selIndex+1, optsEls.length-1); mark(); }
      if(e.key === 'ArrowUp') { selIndex = Math.max(selIndex-1, 0); mark(); }
      if(e.key === 'Enter') { if(optsEls[selIndex]) optsEls[selIndex].click(); }
      if(e.key === 'Escape') { close(); }
      function mark(){ optsEls.forEach((el,i)=> el.setAttribute('aria-selected', i===selIndex ? 'true':'false')); }
    });
    document.addEventListener('click', (e) => { if(!wrap.contains(e.target)) close(); });

    return { pick, close, validate };
  }

  window.TSInitSearch = function TSInitSearch(cfg) {
    if(!localStorage.getItem('ts_session')) localStorage.setItem('ts_session', 'ts-'+Math.random().toString(36).slice(2));
    const fromInput = document.querySelector(cfg.from);
    const toInput = document.querySelector(cfg.to);
    const searchBtn = document.querySelector(cfg.searchBtn);
    const directToggle = document.querySelector(cfg.directToggle);
    const swapBtn = document.querySelector(cfg.swapBtn);

    const state = { fromIATA:'', toIATA:'' };
    const onChange = () => {
      state.fromIATA = fromInput?.dataset.iata || '';
      state.toIATA = toInput?.dataset.iata || '';
      searchBtn.disabled = !(state.fromIATA && state.toIATA);
    };

    const acFrom = createAutocomplete(fromInput, { onPick: onChange, onChange });
    const acTo = createAutocomplete(toInput, { onPick: onChange, onChange });

    if(swapBtn) swapBtn.addEventListener('click', () => {
      const f = { val: fromInput.value, iata: fromInput.dataset.iata };
      fromInput.value = toInput.value; fromInput.dataset.iata = toInput.dataset.iata || '';
      toInput.value = f.val; toInput.dataset.iata = f.iata || '';
      onChange();
    });

    if(directToggle) directToggle.addEventListener('change', () => { /* FE-only filter placeholder */ });

    if(searchBtn) searchBtn.addEventListener('click', () => {
      if(searchBtn.disabled) return;
      console.log('Search', { from: state.fromIATA, to: state.toIATA });
    });

    onChange();
  };
})();