/* HOOKED — pitch materials for the tackle box, shared by the film and the lake page. */
(function () {
  const ICON = {
    jar: '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M10 9h14v4l2 3v12a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V16l2-3z" fill="#EFE6CC" stroke="#26384F" stroke-width="1.6"/><rect x="9" y="5" width="16" height="5" rx="1.5" fill="#E5672A" stroke="#26384F" stroke-width="1.6"/><circle cx="14" cy="22" r="2.4" fill="#E5672A"/><circle cx="20" cy="24" r="2.4" fill="#E5672A"/></svg>',
    book: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="8" y="5" width="18" height="24" rx="1.5" fill="#FFFDF4" stroke="#26384F" stroke-width="1.6"/><rect x="8" y="5" width="4" height="24" fill="#26384F"/><ellipse cx="19" cy="16" rx="4" ry="5" fill="none" stroke="#26384F" stroke-width="1.4"/></svg>',
    phone: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="11" y="4" width="12" height="13" rx="2" fill="#6B7F99" stroke="#26384F" stroke-width="1.6"/><rect x="11" y="17" width="12" height="13" rx="2" fill="#9CB0C4" stroke="#26384F" stroke-width="1.6"/><rect x="13.5" y="6.5" width="7" height="6" fill="#EFE6CC"/></svg>',
    photos: '<svg viewBox="0 0 34 34" aria-hidden="true"><rect x="6" y="9" width="18" height="16" fill="#FFFDF4" stroke="#26384F" stroke-width="1.6" transform="rotate(-8 15 17)"/><rect x="10" y="9" width="18" height="16" fill="#FFFDF4" stroke="#26384F" stroke-width="1.6" transform="rotate(6 19 17)"/><path d="M13 21l4-5 3 3 2-2 3 4z" fill="#9CC3D6"/></svg>',
    map: '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M5 9l8-3 8 3 8-3v19l-8 3-8-3-8 3z" fill="#EFE6CC" stroke="#26384F" stroke-width="1.6"/><path d="M5 15c6-2 10 2 24-2" stroke="#6E979B" stroke-width="3" fill="none"/><circle cx="15" cy="20" r="1.8" fill="#E5672A"/><circle cx="19" cy="20" r="1.8" fill="#E5672A"/></svg>',
    receipt: '<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M9 4h16v26l-2.7-2-2.7 2-2.6-2-2.7 2-2.6-2L9 30z" fill="#FFFFFF" stroke="#26384F" stroke-width="1.6"/><path d="M12 10h10M12 14h10M12 18h7" stroke="#26384F" stroke-width="1.4"/></svg>',
  };
  const ITEMS = [
    { id: 'film', icon: 'jar', name: 'Bait jar', sub: 'The film', html: `
      <span class="kicker">The film</span><h3>HOOKED</h3>
      <p class="tag">Avoid pain. Seek pleasure.</p>
      <p>A young woman kills time with small pleasures. A fisherman kills his with cards and cigarettes. They meet at a lake where nothing bites.</p>
      <dl>
        <dt>Genre</dt><dd>Slice-of-life drama, with dark comedy running underneath. Quiet realism.</dd>
        <dt>Setting</dt><dd>A small town in late summer that feels like it stopped moving years ago.</dd>
        <dt>Language</dt><dd>English and Vietnamese</dd>
        <dt>Format</dt><dd>Short film, 4:3</dd>
      </dl>` },
    { id: 'story', icon: 'book', name: 'Paperback', sub: 'Synopsis', html: `
      <span class="kicker">Synopsis</span><h3>One lake, two people, nothing biting</h3>
      <p>Sen is back in her small hometown for the summer. Her childhood home is being staged to sell. She bikes to get a milkshake and reads <i>1Q84</i> under a tree while she talks to her cousin on the phone about the house.</p>
      <p>At the lake, she sits down next to a fisherman she doesn’t know. He rigs his line, casts and smokes. She tells him about the book and her fever dreams. He walks off partway through, and she keeps talking.</p>
      <p>Off to the side, he takes a call from his mother. In Vietnamese, she brings up his gambling, the money he sends instead of coming home, and his daughter, who is starting to forget him.</p>
      <p>Sen falls asleep in her chair. The fisherman comes back. She wakes up, takes the cigarette from his mouth, and smokes it. They look out at the lake. The bell on his line rings.</p>` },
    { id: 'sides', icon: 'phone', name: 'Flip phone', sub: 'Two versions', html: `
      <span class="kicker">Structure</span><h3>Her end, his end</h3>
      <p>The film plays the same minutes twice: once from Sen’s end of the shore, once from his. She talks to a stranger who isn’t listening; he talks to a mother he won’t go home to. English and Vietnamese never meet. Only the audience hears both.</p>
      <p><b>Avoid pain. Seek pleasure.</b> Sen and the fisherman run on that one rule. She turns to self-pleasure, milkshakes and fireworks to dodge a home being sold out from under her. He turns to cards and cigarettes to dodge the mother and daughter waiting for him. Both are hooked on the quick fix, and neither catches anything.</p>
      <p style="color:var(--ink-soft)">Play scenes 3, 4 and 9 to see the same morning from both chairs.</p>` },
    { id: 'comps', icon: 'photos', name: 'Photo pack', sub: 'Comparable films', html: `
      <span class="kicker">Comps</span><h3>In the company of</h3>
      <div class="comps">
        <div class="comp"><b>Solitude</b><span><i>Tony Takitani</i>, Jun Ichikawa</span></div>
        <div class="comp"><b>Drift</b><span><i>Call Me Chihiro</i>, Rikiya Imaizumi</span></div>
        <div class="comp"><b>Confession</b><span><i>Drive My Car</i>, Ryusuke Hamaguchi</span></div>
        <div class="comp"><b>Restlessness</b><span><i>Dìdi</i>, Sean Wang</span></div>
      </div>` },
    { id: 'making', icon: 'map', name: 'Lake map', sub: 'How it’s made', html: `
      <span class="kicker">Approach</span><h3>Sit still and watch</h3>
      <dl>
        <dt>Story</dt><dd>The flat, tasteless summers of COVID, and the strange feeling of a childhood home that’s no longer yours.</dd>
        <dt>Camera</dt><dd>Wide, observant frames. The camera never moves, except one slow push in on Sen.</dd>
        <dt>Intimacy</dt><dd>Treated as routine, not spectacle.</dd>
        <dt>Sound</dt><dd>Ambient sound and foley, with a sparse jazz score in homage to Ryo Fukui and Ryuichi Sakamoto.</dd>
        <dt>Shoot</dt><dd>Two days, under $4K.</dd>
      </dl>` },
    { id: 'credits', icon: 'receipt', name: 'Receipt', sub: 'Credits and contact', html: `
      <span class="kicker">Credits</span><h3>From the bait-and-tackle shop</h3>
      <div class="receipt">
        <div class="line"><span>WRITTEN &amp; DIRECTED</span><span></span></div>
        <div class="line"><b>Alijah Jacob Buada</b><span></span></div>
        <div class="line"><span>Twice Removed Productions</span><span></span></div>
        <div class="rule"></div>
        <div class="line"><span>AWAKEN</span><span>SDFF 2023</span></div>
        <div class="line"><span></span><span>SDAFF 2023</span></div>
        <div class="line"><span>ADRIFT</span><span>JFFLA 2025</span></div>
        <div class="line"><span></span><span>HIDDEN CITY 2025</span></div>
        <div class="rule"></div>
        <div class="line"><span>NOTHING CAUGHT</span><span>$0.00</span></div>
        <div class="line"><span>THANK YOU, COME AGAIN</span><span></span></div>
      </div>
      <p><b>Serious inquiries and curiosities</b></p>
      <div class="copy"><code id="email">twiceremovedproductions@gmail.com</code><button class="btn" type="button" id="copyEmail">Copy email</button></div>
      <div class="copy"><code>@twiceremovedprod</code><span style="color:var(--ink-soft);font-size:13px">on Instagram</span></div>
      <p class="status" id="copyStatus"></p>` },
  ];
  HK.renderTackle = (itemsEl, detailEl) => {
    itemsEl.innerHTML = '';
    function select(i, focus) {
      [...itemsEl.children].forEach((b, j) => { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
      detailEl.innerHTML = ITEMS[i].html; detailEl.setAttribute('aria-labelledby', 'tab-' + ITEMS[i].id);
      if (focus) itemsEl.children[i].focus();
      const ce = document.getElementById('copyEmail');
      if (ce) ce.addEventListener('click', async () => {
        const st = document.getElementById('copyStatus');
        try { await navigator.clipboard.writeText('twiceremovedproductions@gmail.com'); st.textContent = 'Copied.'; }
        catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById('email')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.'; }
      });
    }
    ITEMS.forEach((it, i) => {
      const b = document.createElement('button');
      b.className = 'item'; b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + it.id;
      b.innerHTML = ICON[it.icon] + `<span>${it.name}<small>${it.sub}</small></span>`;
      b.addEventListener('click', () => select(i));
      b.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % ITEMS.length, true); } if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + ITEMS.length) % ITEMS.length, true); } });
      itemsEl.appendChild(b);
    });
    select(0);
  };
})();
