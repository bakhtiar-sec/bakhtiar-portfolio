/* Blog: reads posts/*.md from your public GitHub repo and shows them on this page.
   Change GH if your username, repo or branch is different. */
(function () {
  var GH = { user: 'bakhtiar-sec', repo: 'bakhtiar-portfolio', branch: 'main' };
  var CACHE = 'blog_posts_v2', TTL = 10 * 60 * 1000;
  var view = document.getElementById('view');
  var posts = null;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return s;
  }

  function markdown(md) {
    var lines = md.replace(/\r/g, '').split('\n'), out = [], para = [], list = null, code = null;
    function flushP() { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } }
    function flushL() {
      if (list) {
        out.push('<' + list.t + '>' + list.i.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + list.t + '>');
        list = null;
      }
    }
    lines.forEach(function (raw, idx) {
      var l = raw.trim(), m;
      if (code !== null) {
        if (l.indexOf('```') === 0) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
        else code.push(raw);
        return;
      }
      if (l.indexOf('```') === 0) { flushP(); flushL(); code = []; return; }
      if (!l) { flushP(); flushL(); return; }
      if ((m = l.match(/^(#{1,3})\s+(.*)$/))) {
        flushP(); flushL();
        var n = Math.min(m[1].length + 1, 3);
        out.push('<h' + n + '>' + inline(m[2]) + '</h' + n + '>');
        return;
      }
      if ((m = l.match(/^\*{2}([^*]+)\*{2}$/))) { flushP(); flushL(); out.push('<h2>' + inline(m[1]) + '</h2>'); return; }
      if ((m = l.match(/^\*{3}([^*]+)\*{3}$/))) { flushP(); flushL(); out.push('<h3 class="grp">' + inline(m[1]) + '</h3>'); return; }
      if ((m = l.match(/^(\d+)\.\s+(.*)$/))) {
        var nx = (lines[idx + 1] || '').trim();
        if (nx && !/^\d+\.\s/.test(nx) && !/^[-*]\s/.test(nx)) {
          flushP(); flushL();
          out.push('<h3>' + inline(m[1] + '. ' + m[2]) + '</h3>');
          return;
        }
        flushP();
        if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', i: [] }; }
        list.i.push(m[2]);
        return;
      }
      if ((m = l.match(/^[-*]\s+(.*)$/))) {
        flushP();
        if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', i: [] }; }
        list.i.push(m[1]);
        return;
      }
      if (/^>\s?/.test(l)) { flushP(); flushL(); out.push('<blockquote>' + inline(l.replace(/^>\s?/, '')) + '</blockquote>'); return; }
      flushL();
      para.push(l);
    });
    flushP(); flushL();
    if (code !== null) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
    return out.join('\n');
  }

  function parse(raw, file) {
    var meta = { title: '', date: '', summary: '', tags: [] }, body = raw.replace(/\r/g, '');
    var m = body.match(/^---\n([\s\S]*?)\n---\n?/);
    if (m) {
      body = body.slice(m[0].length);
      m[1].split('\n').forEach(function (line) {
        var kv = line.match(/^(\w+):\s*(.*)$/);
        if (!kv) return;
        var k = kv[1].toLowerCase(), v = kv[2].trim();
        if (k === 'tags') meta.tags = v.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        else if (k in meta) meta[k] = v;
      });
    }
    var slug = file.replace(/\.md$/i, '');
    if (!meta.title) meta.title = slug.replace(/[-_]+/g, ' ');
    var words = body.trim().split(/\s+/).length;
    return { slug: slug, title: meta.title, date: meta.date, summary: meta.summary, tags: meta.tags,
             body: body.trim(), mins: Math.max(1, Math.round(words / 200)) };
  }

  function fmtDate(d) {
    var t = new Date(d);
    return isNaN(t) ? d : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function metaLine(p) {
    return (p.date ? fmtDate(p.date) + ', ' : '') + p.mins + ' min read';
  }
  function tagsHtml(p) {
    return p.tags.length ? '<div class="tags">' + p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '';
  }

  function api(path) { return 'https://api.github.com/repos/' + GH.user + '/' + GH.repo + '/' + path; }
  function raw(slug) {
    return 'https://raw.githubusercontent.com/' + GH.user + '/' + GH.repo + '/' + GH.branch + '/posts/' + encodeURIComponent(slug) + '.md';
  }

  function loadList() {
    if (posts) return Promise.resolve(posts);
    try {
      var c = JSON.parse(localStorage.getItem(CACHE));
      if (c && Date.now() - c.t < TTL) { posts = c.posts; return Promise.resolve(posts); }
    } catch (e) {}
    return fetch(api('contents/posts')).then(function (r) {
      if (!r.ok) throw new Error('GitHub answered ' + r.status);
      return r.json();
    }).then(function (files) {
      files = files.filter(function (f) { return /\.md$/i.test(f.name); });
      return Promise.all(files.map(function (f) {
        return fetch(f.download_url).then(function (r) { return r.text(); }).then(function (t) { return parse(t, f.name); });
      }));
    }).then(function (list) {
      list.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      posts = list;
      try { localStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), posts: list })); } catch (e) {}
      return list;
    });
  }

  function loadPost(slug) {
    if (posts) {
      var hit = posts.filter(function (p) { return p.slug === slug; })[0];
      if (hit) return Promise.resolve(hit);
    }
    return fetch(raw(slug)).then(function (r) {
      if (!r.ok) throw new Error('not found');
      return r.text();
    }).then(function (t) { return parse(t, slug + '.md'); });
  }

  function showList() {
    document.title = 'Blog – Shaik Abdul Bakhtiar';
    view.innerHTML = '<div class="bhead"><h1>Blog</h1><p>Notes from learning security in public. I only write what I can source, and I want to be corrected when I get it wrong.</p></div><div class="plist"><p class="state">Loading posts…</p></div>';
    var box = view.querySelector('.plist');
    loadList().then(function (list) {
      if (!list.length) { box.innerHTML = '<p class="state">No posts yet.</p>'; return; }
      box.innerHTML = list.map(function (p) {
        return '<a class="post" href="#post/' + encodeURIComponent(p.slug) + '"><h2>' + esc(p.title) + '</h2>' +
          (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
          '<div class="meta">' + esc(metaLine(p)) + '</div>' + tagsHtml(p) + '</a>';
      }).join('');
    }).catch(function (e) {
      box.innerHTML = '<p class="state">Could not load the posts (' + esc(e.message) + '). GitHub limits how often a page can ask, so try again in a minute.</p>';
    });
  }

  function showPost(slug) {
    view.innerHTML = '<a class="back" href="#">All posts</a><p class="state">Loading…</p>';
    loadPost(slug).then(function (p) {
      document.title = p.title + ' – Shaik Abdul Bakhtiar';
      view.innerHTML = '<a class="back" href="#">All posts</a><article class="article"><h1>' + esc(p.title) + '</h1>' +
        '<div class="meta">' + esc(metaLine(p)) + '</div>' + tagsHtml(p) +
        '<div class="body">' + markdown(p.body) + '</div>' +
        '<div class="endnav"><a href="#">All posts</a><a href="https://github.com/' + GH.user + '/' + GH.repo + '/blob/' + GH.branch + '/posts/' + encodeURIComponent(p.slug) + '.md" target="_blank" rel="noopener noreferrer">Source on GitHub</a></div></article>';
      window.scrollTo(0, 0);
    }).catch(function () {
      view.innerHTML = '<a class="back" href="#">All posts</a><p class="state">That post was not found. It may have been renamed.</p>';
    });
  }

  function route() {
    var m = location.hash.match(/^#(?:post|\/blog)\/(.+)$/);
    if (m) showPost(decodeURIComponent(m[1]).replace(/\.md$/i, ''));
    else showList();
  }
  addEventListener('hashchange', route);
  route();
})();
