/* ============================================================
   《盛夏往事》全站公共脚本
   通关状态 / 2013 变化 / 死链 / 软引导 / 弹窗广告 / 页脚
   ============================================================ */

var GameState = {
  KEY: 'shengxia_finished_v1',
  /* 是否已通关（2013 版） */
  is2013: function () {
    try { return localStorage.getItem(this.KEY) === '1'; } catch (e) { return false; }
  },
  /* 触发通关：写入本地存档 */
  finish: function () {
    try { localStorage.setItem(this.KEY, '1'); } catch (e) {}
  }
};

/* ---- 全站相对路径深度：页面可用 window.DEPTH 覆盖（根页为 0，子目录为 1） ---- */
function rootPrefix() {
  if (typeof window.DEPTH === 'number') return window.DEPTH === 0 ? '' : '../';
  // 兜底：按路径猜测
  var p = location.pathname;
  var parts = p.split('/');
  return parts.length - p.replace(/\/$/, '').split('/').length >= 0 && /\/(newspaper|search|forum|chat|weiyu|album|hospital|archive)\//.test(p) ? '../' : '';
}

/* ============================================================
   1. 死链（约 70% 非主线外链） → 统一 404
   ============================================================ */
document.addEventListener('click', function (e) {
  var a = e.target;
  while (a && a.tagName !== 'A') a = a.parentNode;
  if (!a) return;
  if (a.className && a.className.indexOf('dead') >= 0) {
    e.preventDefault();
    location.href = rootPrefix() + '404.html?from=' + encodeURIComponent(location.pathname);
  }
});

/* ============================================================
   2. 停止服务的功能按钮（设为首页 / 加入收藏 / 打印本页等）
   ============================================================ */
function deadFeature(name) {
  alert('「' + name + '」该功能已停止服务。');
}
document.addEventListener('click', function (e) {
  var el = e.target;
  while (el && el.tagName !== 'A' && el.tagName !== 'BUTTON') el = el.parentNode;
  if (el && el.getAttribute && el.getAttribute('data-dead-feature')) {
    e.preventDefault();
    deadFeature(el.getAttribute('data-dead-feature'));
  }
});

/* ============================================================
   3. 页脚 / 顶部 IE 条 / 工具条注入
   ============================================================ */
function buildFooter() {
  var pre = rootPrefix();
  var box = document.getElementById('footer-box');
  if (!box) return;
  var year = GameState.is2013() ? '2013' : '2012';
  box.className = 'site-footer';
  box.innerHTML =
    (window.SITE_EXTRA_FOOTER || '') +
    '<div>本页面为旧网存档快照，版权归原网站所有 · 存档内容时间：' + year + '年</div>' +
    '<div>地址：滨城市江洲路47号　订阅电话：0519-88226617　<a href="' + pre + 'newspaper/index.html">滨城晚报</a> ｜ ' +
    '<a class="dead" href="javascript:void(0)">联系站长</a> ｜ <a class="dead" href="javascript:void(0)">网站地图</a></div>' +
    '<div class="tech-mail">技术维护邮箱：shenjianjun@163.com</div>';
}

function buildIEBar() {
  var box = document.getElementById('iebar-box');
  if (!box) return;
  box.className = 'ie-bar';
  box.innerHTML = '建议使用 IE6.0 以上版本浏览器，分辨率 1024×768 浏览本站，以获得最佳效果';
}

/* ============================================================
   4. 访问计数器 9999 → 10000
   ============================================================ */
function renderCounter(el) {
  if (!el) return;
  var n = GameState.is2013() ? 10000 : 9999;
  var html = '<span class="counter">';
  for (var i = 0; i < String(n).length; i++) {
    html += '<span class="digit">' + String(n).charAt(i) + '</span>';
  }
  html += '</span>';
  if (GameState.is2013()) html += '<span class="counter-thanks">第一万位访客，谢谢你来过。</span>';
  el.innerHTML = html;
}

/* ============================================================
   5. 软引导：停留 10 分钟无操作 → 角落极淡提示
   ============================================================ */
var SoftHint = {
  timer: null,
  start: function (hintText) {
    var reset = function () {
      clearTimeout(this.timer);
      var box = document.getElementById('soft-hint-box');
      if (box) box.className = 'soft-hint';
      this.timer = setTimeout(function () {
        var b = document.getElementById('soft-hint-box');
        if (!b) return;
        b.textContent = hintText;
        b.className = 'soft-hint show';
      }, 10 * 60 * 1000);
    }.bind(this);
    reset();
    document.addEventListener('click', reset);
    document.addEventListener('keydown', reset);
  },
  ensureBox: function () {
    var b = document.getElementById('soft-hint-box');
    if (!b) {
      b = document.createElement('div');
      b.id = 'soft-hint-box';
      b.className = 'soft-hint';
      document.body.appendChild(b);
    }
  }
};

/* ============================================================
   6. 弹窗广告（含彩蛋：儿童医院救助热线小字）
   ============================================================ */
var PopupAds = {
  shown: {},
  ads: [
    {
      key: 'hospital',
      title: '滨城儿童医院 · 暑期儿童健康义诊周',
      pic: 'images/popup_hospital.jpg',
      body: '我院心内科常年开展儿童先天性心脏病筛查与救助咨询，家长可带孩子免费做心脏听诊与基础检查。',
      hotline: '（先天性心脏病救助热线小字：0519-88226617 转 心内二科）'
    },
    {
      key: 'english',
      title: '滨城剑桥英语暑期培训班招生',
      body: '外教小班授课，报名即送电子词典一台！咨询电话：0519-86001234。',
      hotline: ''
    },
    {
      key: 'mall',
      title: '江洲百货 夏季清仓大酬宾',
      body: '全场夏装 3 折起，家电以旧换新，活动时间：8月10日—8月31日。',
      hotline: ''
    },
    {
      key: 'driving',
      title: '滨城驾校 暑期学生班特惠',
      body: '凭学生证立减 300 元，二人同报再减 100！',
      hotline: ''
    },
    {
      key: 'netbar',
      title: '江南网苑 · 会员充值大赠送',
      body: '液晶区 3 元/小时，会员充值 100 元送 20 元，通宵包夜 8 元！地址：江洲路49号二楼。',
      hotline: ''
    },
    {
      key: '少年宫',
      title: '滨城少年宫 暑期兴趣班招生',
      body: '书法、国画、电子琴、航模、舞蹈兴趣班，8月开课，名额有限。咨询电话：0519-87002233。',
      hotline: ''
    }
  ],
  /* 约 55% 概率弹一次，保证 hospital 广告会轮换出现 */
  maybeShow: function () {
    var key = 'popup_seen_' + location.pathname;
    try { if (sessionStorage.getItem(key)) return; } catch (e) {}
    if (Math.random() > 0.55) return;
    try { sessionStorage.setItem(key, '1'); } catch (e) {}
    var ad;
    var seenAll = true;
    for (var i = 0; i < this.ads.length; i++) {
      try { if (!sessionStorage.getItem('ad_seen_' + this.ads[i].key)) seenAll = false; } catch (e) {}
    }
    do {
      ad = this.ads[Math.floor(Math.random() * this.ads.length)];
    } while (seenAll === false && (function () {
      try { if (sessionStorage.getItem('ad_seen_' + ad.key)) return true; } catch (e) {}
      return false;
    })());
    try { sessionStorage.setItem('ad_seen_' + ad.key, '1'); } catch (e) {}
    this.show(ad);
  },
  show: function (ad) {
    var mask = document.createElement('div');
    mask.className = 'popup-mask';
    mask.style.display = 'block';
    var win = document.createElement('div');
    win.className = 'popup-win';
    var html = '<div class="popup-titlebar"><span>' + ad.title + '</span><span class="x" title="关闭">×</span></div>' +
      '<div class="popup-body">';
    if (ad.pic) html += '<img class="ad-pic" src="' + rootPrefix() + ad.pic + '" alt="">';
    html += '<div class="ad-normal">' + ad.body + '</div>';
    if (ad.hotline) html += '<div class="hotline-tiny">' + ad.hotline + '</div>';
    html += '<div class="center mt8"><button class="btn btn-sm">我知道了</button></div></div>';
    win.innerHTML = html;
    document.body.appendChild(mask);
    document.body.appendChild(win);
    function close() { mask.remove(); win.remove(); }
    win.querySelector('.x').onclick = close;
    win.querySelector('button').onclick = close;
  }
};

/* ============================================================
   7. 存档页：30 秒后标签标题变化 + 关闭时闪现
   ============================================================ */
var ArchiveTitle = {
  start: function () {
    var orig = document.title;
    setTimeout(function () {
      document.title = '沈知栀的夏天 2012';
    }, 30000);
    /* 关闭 / 切换标签的瞬间标题最后闪一下 */
    window.addEventListener('pagehide', function () {
      document.title = '下次再来啊';
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) document.title = '下次再来啊';
      else document.title = orig;
    });
  }
};

/* ============================================================
   8. 音频系统（程序化 UI 音效 + 本地氛围音，首次交互后初始化）
   ============================================================ */
var AudioEngine = {
  KEY: 'shengxia_audio_v1',
  AUDIO_DIR: 'audio/',
  ctx: null,
  master: null,
  ambientBus: null,
  uiBus: null,
  buffers: {},
  layers: {},
  inited: false,
  enabled: true,
  _connecting: false,
  _modemOn: false,
  _modemGo: null,

  /* ---- 偏好：localStorage 记忆开关 ---- */
  loadPref: function () {
    var v = null;
    try { v = localStorage.getItem(this.KEY); } catch (e) {}
    this.enabled = (v === null) ? true : (v === '1');
    return this.enabled;
  },
  savePref: function (on) {
    try { localStorage.setItem(this.KEY, on ? '1' : '0'); } catch (e) {}
  },

  /* ---- 首次交互后创建 AudioContext（满足自动播放策略，避免控制台警告） ---- */
  unlock: function () {
    if (!this.inited) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx;
      try { ctx = new AC(); } catch (e) { return; }
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.enabled ? 0.9 : 0.0001;
      this.master.connect(ctx.destination);
      this.ambientBus = ctx.createGain();
      this.ambientBus.gain.value = 1;
      this.ambientBus.connect(this.master);
      this.uiBus = ctx.createGain();
      this.uiBus.gain.value = 1;
      this.uiBus.connect(this.master);
      this.inited = true;
      this.buildSpeaker();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      var self = this;
      try {
        this.ctx.resume().then(function () {
          if (self.enabled && self.ctx.state === 'running') self.startScene();
        });
      } catch (e) {}
    }
    if (this.enabled && this.ctx && this.ctx.state === 'running') this.startScene();
  },

  /* ---- 主开关：平滑淡入淡出 ---- */
  toggle: function () {
    if (!this.inited) { this.enabled = true; this.unlock(); return true; }
    this.enabled = !this.enabled;
    this.savePref(this.enabled);
    var t = this.ctx.currentTime, g = this.master.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(this.enabled ? 0.9 : 0.0001, t + 0.35);
    this.updateSpeakerIcon();
    if (this.enabled) { this.unlock(); this.startScene(); }
    return this.enabled;
  },

  /* ================= 程序化 UI 音效 ================= */
  ui: function (name) {
    if (!this.inited || !this.enabled || !this.ctx) return;
    var ctx = this.ctx, t = ctx.currentTime, out = this.uiBus;
    function tone(freq, start, dur, type, vol, freqEnd) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t + start);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + start + dur);
      g.gain.setValueAtTime(0.0001, t + start);
      g.gain.exponentialRampToValueAtTime(vol, t + start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      o.connect(g); g.connect(out);
      o.start(t + start); o.stop(t + start + dur + 0.03);
    }
    function noiseBurst(start, dur, vol, filterType, freq, freqEnd, q) {
      var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter();
      f.type = filterType || 'bandpass';
      f.frequency.setValueAtTime(freq, t + start);
      if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + start + dur);
      f.Q.value = q || 0.8;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + start);
      g.gain.exponentialRampToValueAtTime(vol, t + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      src.connect(f); f.connect(g); g.connect(out);
      src.start(t + start); src.stop(t + start + dur + 0.03);
    }
    switch (name) {
      case 'click':   noiseBurst(0, 0.04, 0.10, 'highpass', 1800, 1800, 0.5); break;
      case 'link':    tone(740, 0, 0.05, 'sine', 0.10); break;
      case 'page':    noiseBurst(0, 0.18, 0.09, 'bandpass', 2600, 650, 0.7); break;
      case 'message': /* 自创“滴滴”两段提示音，不模仿任何真实品牌 */
        tone(880, 0, 0.09, 'sine', 0.09);
        tone(1174.7, 0.10, 0.13, 'sine', 0.09); break;
      case 'notify':  tone(987.77, 0, 0.18, 'sine', 0.08); break;
      case 'shutter': /* 柔和快门：两声短噪 */
        noiseBurst(0, 0.05, 0.16, 'lowpass', 3200, 3200, 0.5);
        noiseBurst(0.075, 0.05, 0.13, 'lowpass', 2400, 2400, 0.5); break;
    }
  },

  /* ================= 本地氛围音 ================= */
  loadBuffer: function (file, cb) {
    if (this.buffers[file]) { cb(this.buffers[file]); return; }
    var self = this;
    var url = rootPrefix() + this.AUDIO_DIR + file;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      if (xhr.status !== 200 && xhr.status !== 0) { cb(null); return; }
      self.ctx.decodeAudioData(xhr.response, function (buf) {
        self.buffers[file] = buf; cb(buf);
      }, function () { cb(null); });
    };
    xhr.onerror = function () { cb(null); };
    try { xhr.send(); } catch (e) { cb(null); }
  },

  /* 播放循环氛围层：两段持续交叉淡化，杜绝接缝爆音 */
  playLayer: function (name, file, volume) {
    if (!this.inited) return;
    if (this.layers[name] && this.layers[name].file === file) return;
    if (this.layers[name]) this.stopLayer(name);
    var self = this;
    this.loadBuffer(file, function (buf) {
      if (!buf) return;
      if (self.layers[name] && self.layers[name].file !== file) return;
      var bus = self.ctx.createGain();
      bus.gain.value = 0.0001;
      bus.connect(self.ambientBus);
      var layer = { file: file, buffer: buf, bus: bus, volume: volume, cursor: 0, timer: null };
      self.layers[name] = layer;
      var now = self.ctx.currentTime;
      bus.gain.setValueAtTime(0.0001, now);
      bus.gain.exponentialRampToValueAtTime(volume, now + 2.4);
      self._runLoop(name);
    });
  },

  _runLoop: function (name) {
    var self = this, layer = this.layers[name];
    if (!layer) return;
    var ctx = this.ctx, d = layer.buffer.duration;
    var fade = Math.min(4, d * 0.2);
    var start0 = ctx.currentTime + 0.1;
    function scheduleIndex(k) {
      var start = start0 + k * (d - fade);
      var src = ctx.createBufferSource();
      src.buffer = layer.buffer;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(1, start + fade);
      g.gain.setValueAtTime(1, Math.max(start + fade, start + d - fade));
      g.gain.exponentialRampToValueAtTime(0.0001, start + d);
      src.connect(g); g.connect(layer.bus);
      src.start(start); src.stop(start + d + 0.05);
    }
    function tick() {
      var now = ctx.currentTime;
      while (start0 + layer.cursor * (d - fade) < now + 12) {
        scheduleIndex(layer.cursor);
        layer.cursor++;
      }
    }
    tick();
    layer.timer = setInterval(tick, 2000);
  },

  stopLayer: function (name) {
    var layer = this.layers[name];
    if (!layer) return;
    delete this.layers[name];
    if (layer.timer) clearInterval(layer.timer);
    var now = this.ctx.currentTime, bus = layer.bus;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), now);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(function () { try { bus.disconnect(); } catch (e) {} }, 1600);
  },

  /* 一次性音效（modem 拨号） */
  playOneShot: function (file, vol) {
    if (!this.inited || !this.enabled) return null;
    var self = this, token = { src: null, gain: null, ok: false };
    this.loadBuffer(file, function (buf) {
      if (!buf || !self._modemOn || !self.ctx) return;
      var src = self.ctx.createBufferSource();
      src.buffer = buf;
      var g = self.ctx.createGain();
      g.gain.value = vol;
      src.connect(g); g.connect(self.ambientBus);
      src.start();
      token.src = src; token.gain = g; token.ok = true;
    });
    return token;
  },
  stopOneShot: function (token) {
    if (token && token.src) { try { token.src.stop(); } catch (e) {} }
  },

  /* 一次性短旋律 stinger（相册解锁八音盒等，不循环、自带淡入淡出） */
  playStinger: function (file, vol) {
    if (!this.inited || !this.enabled || !this.ctx) return;
    var self = this;
    this.loadBuffer(file, function (buf) {
      if (!buf || !self.ctx) return;
      var now = self.ctx.currentTime;
      var src = self.ctx.createBufferSource();
      src.buffer = buf;
      var g = self.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.3);
      g.gain.setValueAtTime(vol, now + Math.max(0.3, buf.duration - 0.9));
      g.gain.exponentialRampToValueAtTime(0.0001, now + buf.duration);
      src.connect(g); g.connect(self.ambientBus);
      src.start(now);
      src.stop(now + buf.duration + 0.1);
      setTimeout(function () { try { g.disconnect(); } catch (e) {} } , (buf.duration + 0.4) * 1000);
    });
  },

  /* ================= 场景映射（按路径，克制低音量） ================= */
  sceneForPath: function () {
    var p = location.pathname;
    if (/\/archive\//.test(p))   return { layers: [{ n: 'music', f: 'archive_piano.mp3', v: 0.15 }, { n: 'cicada', f: 'summer_cicadas.mp3', v: 0.04 }], sea: true };
    if (/\/hospital\//.test(p))  return { layers: [{ n: 'amb', f: 'hospital_ambient.mp3', v: 0.11 }] };
    if (/\/newspaper\//.test(p)) return { layers: [{ n: 'amb', f: 'city_distant.mp3', v: 0.12 }, { n: 'detail', f: 'market_detail.mp3', v: 0.09 }] };
    if (/\/chat\//.test(p))      return { layers: [{ n: 'amb', f: 'summer_cicadas.mp3', v: 0.05 }] };
    if (/\/weiyu\//.test(p))     return { layers: [{ n: 'amb', f: 'summer_cicadas.mp3', v: 0.07 }] };
    if (/\/album\//.test(p))     return { layers: [{ n: 'amb', f: 'summer_cicadas.mp3', v: 0.06 }] };
    if (/\/forum\//.test(p))     return { layers: [{ n: 'amb', f: 'summer_cicadas.mp3', v: 0.09 }, { n: 'bustle', f: 'forum_ambience.mp3', v: 0.08 }] };
    /* 档案馆入口：极轻机房嗡鸣 */
    return { layers: [{ n: 'amb', f: 'server_hum.mp3', v: 0.05 }] };
  },
  startScene: function () {
    if (!this.inited || !this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    var scene = this.sceneForPath();
    if (!scene) return;
    for (var i = 0; i < scene.layers.length; i++) {
      this.playLayer(scene.layers[i].n, scene.layers[i].f, scene.layers[i].v);
    }
    if (scene.sea) this.watchSea();
  },

  /* 存档页：补完海边画进入视口时，极轻海浪 */
  watchSea: function () {
    var img = document.querySelector('.sea-pic img');
    if (!img || !('IntersectionObserver' in window)) return;
    var self = this;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) self.playLayer('sea', 'sea_waves.mp3', 0.09);
        else self.stopLayer('sea');
      });
    }, { threshold: 0.25 });
    io.observe(img);
  },

  /* ================= 拨号连接遮罩（档案馆点文件夹） ================= */
  wireModem: function () {
    var link = document.getElementById('summer-link');
    if (!link) return;
    var self = this;
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (self._connecting) return;
      self._connecting = true;
      self.loadPref();
      if (!self.inited) self.unlock();
      self._modemOn = true;
      var node = self.enabled ? self.playOneShot('modem_handshake.mp3', 0.32) : null;
      self.showConnectOverlay();
      var navigated = false;
      function go() {
        if (navigated) return;
        navigated = true;
        self._modemOn = false;
        self.stopOneShot(node);
        self.hideConnectOverlay();
        location.href = rootPrefix() + 'newspaper/index.html';
      }
      self._modemGo = go;
      setTimeout(go, 6000);
    });
  },
  showConnectOverlay: function () {
    var mask = document.createElement('div');
    mask.id = 'connect-mask';
    mask.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(18,26,18,.8);display:flex;align-items:center;justify-content:center;';
    var box = document.createElement('div');
    box.id = 'connect-box';
    box.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;background:#ece9d8;border:1px solid #0831d9;box-shadow:4px 4px 16px rgba(0,0,0,.5);width:380px;max-width:90%;font-family:"Microsoft YaHei",sans-serif;';
    box.innerHTML =
      '<div style="background:linear-gradient(#0a64d6,#0a46a8);color:#fff;padding:5px 10px;font-size:13px;">正在连接 2012_summer</div>' +
      '<div style="padding:18px 16px;background:#fff;font-size:13px;line-height:1.9;color:#222;">' +
      '<div id="connect-line">正在通过电话线拨号…</div>' +
      '<div style="border:1px solid #9ab4d8;height:14px;margin-top:8px;background:#fff;">' +
      '<div id="connect-bar" style="width:0;height:100%;background:#3a8bdf;"></div></div>' +
      '<div class="gray" style="font-size:11px;margin-top:10px;">56k 调制解调器正在握手（点击任意处可跳过）</div>' +
      '</div>';
    document.body.appendChild(mask);
    document.body.appendChild(box);
    var steps = ['正在通过电话线拨号…', '调制解调器正在握手…', '正在传输数据…', '连接成功，正在打开…'];
    var i = 0;
    this._connectTimer = setInterval(function () {
      i++;
      var bar = document.getElementById('connect-bar'), line = document.getElementById('connect-line');
      if (bar) bar.style.width = Math.min(100, i * 26) + '%';
      if (line && steps[i]) line.textContent = steps[i];
    }, 1400);
    var self = this;
    mask.addEventListener('click', function () { if (self._modemGo) self._modemGo(); });
  },
  hideConnectOverlay: function () {
    if (this._connectTimer) clearInterval(this._connectTimer);
    var m = document.getElementById('connect-mask'), b = document.getElementById('connect-box');
    if (m) m.remove();
    if (b) b.remove();
  },

  /* ================= 拟物喇叭开关 ================= */
  speakerSVG: function (on) {
    var glyph = '<path d="M4 10v6h4l5 4V6L8 10H4z" fill="#5a6150" stroke="#334" stroke-width="0.8"/>';
    var waves = on
      ? '<path d="M16 15.5a4 4 0 010 5" fill="none" stroke="#334" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M18.5 13a7 7 0 010 10" fill="none" stroke="#334" stroke-width="1.2" stroke-linecap="round"/>'
      : '<line x1="16" y1="14" x2="22" y2="22" stroke="#888" stroke-width="1.6" stroke-linecap="round"/>' +
        '<line x1="22" y1="14" x2="16" y2="22" stroke="#888" stroke-width="1.6" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 26 26" width="24" height="24">' + glyph + waves + '</svg>';
  },
  buildSpeaker: function () {
    if (document.getElementById('speaker-btn')) return;
    var self = this;
    var b = document.createElement('button');
    b.id = 'speaker-btn';
    b.type = 'button';
    b.title = '声音开关';
    b.setAttribute('aria-label', '声音开关');
    b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9000;width:44px;height:44px;border-radius:50%;border:1px solid #8a8f80;background:linear-gradient(#fdfdfd,#cfd6c8);box-shadow:2px 2px 6px rgba(0,0,0,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;';
    b.innerHTML = this.speakerSVG(this.enabled);
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); self.toggle(); });
    document.body.appendChild(b);
  },
  updateSpeakerIcon: function () {
    var b = document.getElementById('speaker-btn');
    if (b) b.innerHTML = this.speakerSVG(this.enabled);
  }
};

/* 音频交互接线（手势解锁 / 场景动作音效） */
function bindAudio() {
  AudioEngine.loadPref();
  /* 首次交互解锁 */
  document.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.id === 'speaker-btn') return;
    AudioEngine.unlock();
  });
  document.addEventListener('keydown', function () { AudioEngine.unlock(); });
  /* 移动端：touchstart 兜底解锁（真实设备的触摸即受信手势） */
  document.addEventListener('touchstart', function (e) {
    if (e.target && e.target.id === 'speaker-btn') return;
    AudioEngine.unlock();
  }, { passive: true });

  /* 通用点击音：链接“叮”、按钮“哒”（在 pointerdown 阶段，赶在导航前起音） */
  document.addEventListener('pointerdown', function (e) {
    var el = e.target;
    if (el && el.id === 'speaker-btn') return;
    var a = el; while (a && a.tagName !== 'A') a = a.parentNode;
    if (a && a.id === 'summer-link') return; /* 文件夹交给 modem 声 */
    if (a) { AudioEngine.ui('link'); return; }
    var b = el; while (b && b.tagName !== 'BUTTON') b = b.parentNode;
    if (b) AudioEngine.ui('click');
  });

  /* 翻页：长帖/搜索结果分页（拦截，播完翻页音再跳转） */
  document.addEventListener('click', function (e) {
    var a = e.target;
    while (a && a.tagName !== 'A') a = a.parentNode;
    if (!a || !a.closest) return;
    var pager = a.closest('.pager');
    var href = a.getAttribute('href');
    if (pager && href && href.indexOf('javascript') !== 0) {
      e.preventDefault();
      AudioEngine.ui('page');
      setTimeout(function () { location.href = href; }, 230);
    }
  });

  /* 讯聊：切换联系人“滴滴” */
  document.addEventListener('click', function (e) {
    var c = e.target;
    while (c && !(c.className && c.className.indexOf && c.className.indexOf('contact') >= 0)) c = c.parentNode;
    if (c && c.closest('.qq-shell')) AudioEngine.ui('message');
  });

  /* 相册：点照片“柔和快门” */
  document.addEventListener('click', function (e) {
    var f = e.target;
    while (f && !(f.className && f.className.indexOf && f.className.indexOf('photo-frame') >= 0)) f = f.parentNode;
    if (f && f.closest('.album-page')) AudioEngine.ui('shutter');
  });

  /* 页面切换：淡出 / bfcache 恢复淡入 */
  window.addEventListener('pagehide', function () {
    if (AudioEngine.ctx) {
      var t = AudioEngine.ctx.currentTime, g = AudioEngine.master.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0.0001, t + 0.08);
    }
  });
  window.addEventListener('pageshow', function () {
    if (AudioEngine.ctx && AudioEngine.enabled) {
      AudioEngine.unlock();
      var t = AudioEngine.ctx.currentTime, g = AudioEngine.master.gain;
      g.setValueAtTime(0.0001, t);
      g.linearRampToValueAtTime(0.9, t + 0.6);
    }
  });
}

/* ============================================================
   9. 初始化
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  buildIEBar();
  buildFooter();
  SoftHint.ensureBox();
  var counterEl = document.getElementById('counter-box');
  if (counterEl) renderCounter(counterEl);
  if (window.SOFT_HINT_TEXT) SoftHint.start(window.SOFT_HINT_TEXT);
  if (window.ENABLE_POPUP !== false && !GameState.is2013()) PopupAds.maybeShow();
  /* 音频 */
  AudioEngine.loadPref();
  AudioEngine.buildSpeaker();
  AudioEngine.wireModem();
  bindAudio();
});
