/* ============================================================
   《盛夏往事》全站公共脚本
   通关状态 / 2013 变化 / 死链 / 软引导 / 弹窗广告 / 页脚
   ============================================================ */

/* Session fallback keeps progress usable when persistent storage is unavailable. */
var GameStorage = {
  memory: {}, persistent: true, session: true,
  get: function(key, fallback) {
    var v=null;
    try { v=sessionStorage.getItem('shengxia_override_'+key); if(v!==null)return v; } catch(e) {this.session=false;}
    try { v=localStorage.getItem(key); if(v!==null)return v; } catch(e) {this.persistent=false;}
    try { v=sessionStorage.getItem(key); if(v!==null)return v; } catch(e) {this.session=false;}
    return Object.prototype.hasOwnProperty.call(this.memory,key)?this.memory[key]:fallback;
  },
  set: function(key,value) {
    value=String(value);this.memory[key]=value;var saved=false;
    try {localStorage.setItem(key,value);saved=true;this.persistent=true;}catch(e){this.persistent=false;}
    try {sessionStorage.setItem(key,value);if(saved)sessionStorage.removeItem('shengxia_override_'+key);else sessionStorage.setItem('shengxia_override_'+key,value);this.session=true;}catch(e){this.session=false;}
    return saved;
  },
  tabGet: function(key) {try{return sessionStorage.getItem(key);}catch(e){try{return localStorage.getItem('shengxia_tab_'+key)||this.memory[key]||null;}catch(e2){return this.memory[key]||null;}}},
  tabSet: function(key,value) {this.memory[key]=value;try{if(value===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,value);}catch(e){try{if(value===null)localStorage.removeItem('shengxia_tab_'+key);else localStorage.setItem('shengxia_tab_'+key,value);}catch(e2){}}}
};
var GameState = {
  KEY: 'shengxia_finished_v1',
  is2013: function () {return GameStorage.get(this.KEY,'0')==='1' && GameStorage.tabGet('shengxia_view_year_v2')!=='2012';},
  finish: function () {GameStorage.set(this.KEY,'1');GameStorage.tabSet('shengxia_view_year_v2',null);}
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
  if (a.classList && a.classList.contains('dead')) {
    if (typeof RuntimeUI !== 'undefined') {
      RuntimeUI.rememberReturn();RuntimeUI.prepareDeadLink(a);
    } else {
      e.preventDefault();
      location.href=rootPrefix()+'404.html?from='+encodeURIComponent(location.pathname+location.search+location.hash);
    }
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
    '<div>本页面为旧网存档快照，版权归原网站所有 · 各页日期按原记录保留</div>' +
    '<div>地址：滨城市江洲路47号　订阅电话：0519-88226617　<a href="' + pre + 'newspaper/index.html">滨城晚报</a> ｜ ' +
    '<a href="'+pre+'catalog.html?post=contact">联系站长</a> ｜ <a href="'+pre+'catalog.html">网站地图</a></div>' +
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
  el.innerHTML = html;
  if (GameState.is2013()) {
    var thanks = document.createElement('span'); thanks.className = 'counter-thanks'; thanks.textContent = '第一万位访客，谢谢你来过。';
    el.parentNode.appendChild(thanks);
  }
}

/* ============================================================
   5. 主动分级提示 / 停留两分钟后的轻提醒
   ============================================================ */
var SoftHint = {
  timer: null,
  start: function () {
    var self = this;
    this.timer = setTimeout(function () {
      var b = document.getElementById('soft-hint-box');
      if (b && !document.hidden) b.textContent = '需要一点提示？';
    }, 120000);
  },
  ensureBox: function () {
    if (!window.SOFT_HINT_TEXT) return;
    var b = document.createElement('button');
    b.id = 'soft-hint-box'; b.type = 'button'; b.textContent = '提示';
    b.className = 'runtime-tool runtime-hint';
    b.onclick = function () { RuntimeUI.showHint(); };
    document.body.appendChild(b);
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
    var available=this.ads.filter(function(ad){try{return !sessionStorage.getItem('ad_seen_'+ad.key);}catch(e){return true;}});
    if(!available.length) available=this.ads;
    var ad=available[Math.floor(Math.random()*available.length)];
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
    var previous=document.activeElement; win.setAttribute('role','dialog'); win.setAttribute('aria-modal','true'); win.setAttribute('aria-label',ad.title);
    var x=win.querySelector('.x'); x.tabIndex=0; x.setAttribute('role','button'); x.setAttribute('aria-label','关闭广告');
    x.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();close();}});
    win.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){var first=x,last=win.querySelector('button');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    function close() { mask.remove(); win.remove(); if(previous&&previous.isConnected)previous.focus({preventScroll:true}); }
    win.querySelector('button').focus({preventScroll:true});
    win.querySelector('.x').onclick = close;
    win.querySelector('button').onclick = close;
  }
};

/* ============================================================
   7. 存档页：30 秒后标签标题变化 + 关闭时闪现
   ============================================================ */
var ArchiveTitle = {
  start: function () {
    var orig = document.title, changed = false;
    setTimeout(function () {
      document.title = '沈知栀的夏天 2012'; changed = true;
    }, 30000);
    /* 关闭 / 切换标签的瞬间标题最后闪一下 */
    window.addEventListener('pagehide', function () {
      document.title = '下次再来啊';
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) document.title = '下次再来啊';
      else document.title = changed ? '沈知栀的夏天 2012' : orig;
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
    var v = GameStorage.get(this.KEY,null);
    this.enabled = (v === null) ? true : (v === '1');
    return this.enabled;
  },
  savePref: function (on) {
    GameStorage.set(this.KEY, on ? '1' : '0');
  },

  /* ---- 首次交互后创建 AudioContext（满足自动播放策略，避免控制台警告） ---- */
  unlock: function () {
    if (!this.enabled || document.hidden || this._pageHidden) return;
    if (!this.inited) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx;
      try { ctx = new AC(); } catch (e) { return; }
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.enabled ? 0.9 : 0;
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
    if (this._suspending) return;
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed' && !this._resuming) {
      var self=this;this._resuming=true;
      this.ctx.resume().then(function(){self._resuming=false;self.applyPlaybackState(false);if(self.enabled&&!document.hidden&&!self._pageHidden&&self.ctx.state==='running')self.startScene();},function(){self._resuming=false;});
    }
    if (this.ctx && this.ctx.state === 'running') this.startScene();
  },
  setEnabled: function(on,persist) {
    this.enabled=!!on;
    if(persist) this.savePref(this.enabled);
    this.applyPlaybackState(true);if(this.enabled&&!this.inited)this.unlock();this.updateSpeakerIcon();
    return this.enabled;
  },
  toggle: function() {return this.setEnabled(!this.enabled,true);},
  applyPlaybackState: function(resume) {
    var allowed=this.enabled&&!document.hidden&&!this._pageHidden;
    if(this.ctx&&this.master){
      var t=this.ctx.currentTime,g=this.master.gain;
      g.cancelScheduledValues(0);g.value=allowed?0.9:0;
      if(!allowed&&this.ctx.state==='running'&&!this._suspending){
        var self=this;this._suspending=true;
        this.ctx.suspend().then(function(){self._suspending=false;if(self.enabled&&!document.hidden&&!self._pageHidden)self.unlock();},function(){self._suspending=false;});
      }
    }
    if(!this.enabled){var self=this;Object.keys(this.layers).forEach(function(name){self.stopLayer(name);});}
    this.syncLocalMedia();
    if(allowed&&resume&&this.inited)this.unlock();

  },

  /* ================= 程序化 UI 音效 ================= */
  ui: function (name) {
    if (!this.inited || !this.enabled || !this.ctx || document.hidden || this._pageHidden) return;
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
  pendingBuffers: {},
  loadBuffer: function (file, cb) {
    if (this.buffers[file]) { cb(this.buffers[file]); return; }
    if (this.pendingBuffers[file]) { this.pendingBuffers[file].push(cb); return; }
    this.pendingBuffers[file] = [cb];
    var self = this, xhr = new XMLHttpRequest();
    function done(buf) {
      var callbacks = self.pendingBuffers[file];
      if (!callbacks) return;
      delete self.pendingBuffers[file];
      if (buf) self.buffers[file] = buf;
      callbacks.forEach(function (f) { f(buf); });
    }
    xhr.open('GET', rootPrefix() + this.AUDIO_DIR + file, true);
    xhr.responseType = 'arraybuffer'; xhr.timeout = 20000;
    xhr.onload = function () {
      if (xhr.status !== 200 && xhr.status !== 0) { done(null); return; }
      try { self.ctx.decodeAudioData(xhr.response, done, function () { done(null); }); }
      catch (e) { done(null); }
    };
    xhr.onerror = xhr.ontimeout = function () { done(null); };
    try { xhr.send(); } catch (e) { done(null); }
  },
  playLayer: function (name, file, volume) {
    if (!this.inited || !this.enabled) return;
    if (this.layers[name] && this.layers[name].file === file) {
      var existing = this.layers[name];
      if (existing.media && existing.media.paused && !document.hidden) existing.media.play().catch(function () {});
      return;
    }
    if (this.layers[name]) this.stopLayer(name);
    var self = this, layer = { file: file, volume: volume, cursor: 0, timer: null, sources: [] };
    this.layers[name] = layer;
    if (location.protocol === 'file:') {
      var media = new Audio(rootPrefix() + this.AUDIO_DIR + file);
      layer.media = media; media.loop = true; media.volume = volume * 0.9;
      if (!document.hidden) media.play().catch(function () {});
      return;
    }
    this.loadBuffer(file, function (buf) {
      if (self.layers[name] !== layer) return;
      if (!buf) { delete self.layers[name]; return; }
      var bus = self.ctx.createGain(); bus.gain.value = 0.0001; bus.connect(self.ambientBus);
      layer.buffer = buf; layer.bus = bus;
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
      layer.sources.push(src);
      src.onended=function(){var index=layer.sources.indexOf(src);if(index>=0)layer.sources.splice(index,1);try{src.disconnect();g.disconnect();}catch(e){}};
      src.start(start); src.stop(start + d + 0.05);
    }
    function tick() {
      if(document.hidden || self._pageHidden || !self.enabled)return;
      var now = ctx.currentTime;
      layer.cursor=Math.max(layer.cursor,Math.floor(Math.max(0,now-start0)/(d-fade)));
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
    if (layer.media) { layer.media.pause(); layer.media.removeAttribute('src'); layer.media.load(); return; }
    if (!layer.bus) return;
    if (layer.timer) clearInterval(layer.timer);
    var now = this.ctx.currentTime, bus = layer.bus;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), now);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(function () {
      layer.sources.slice().forEach(function(src){try{src.stop();}catch(e){}});
      try { bus.disconnect(); } catch (e) {}
    }, 1600);
  },

  /* 一次性音效（modem 拨号） */
  playOneShot: function (file, vol) {
    if (!this.inited || !this.enabled) return null;
    var self = this, token = { src: null, gain: null, ok: false };
    if (location.protocol === 'file:') {
      token.media = new Audio(rootPrefix() + this.AUDIO_DIR + file);
      token.media.volume = vol * 0.9; token.media.play().catch(function () {}); this.localOneShot = token.media; return token;
    }
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
    if (token && token.media) token.media.pause();
    if (token && token.src) { try { token.src.stop(); } catch (e) {} }
  },

  /* 一次性短旋律 stinger（相册解锁八音盒等，不循环、自带淡入淡出） */
  playStinger: function (file, vol) {
    if (!this.inited || !this.enabled || !this.ctx || document.hidden || this._pageHidden) return;
    var self = this;
    if (location.protocol === 'file:') {
      var media = new Audio(rootPrefix() + this.AUDIO_DIR + file); media.volume = vol * 0.9;
      this.localStinger = media; media.play().catch(function () {}); return;
    }
    this.loadBuffer(file, function (buf) {
      if (!buf || !self.ctx || !self.enabled || document.hidden) return;
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
    if (scene.sea) { this.watchSea(); if (this._seaVisible) this.playLayer('sea', 'sea_waves.mp3', 0.09); }
  },

  /* 存档页：补完海边画进入视口时，极轻海浪 */
  watchSea: function () {
    if (this._seaObserver) return;
    var img = document.querySelector('.sea-pic img');
    if (!img || !('IntersectionObserver' in window)) return;
    var self = this;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        self._seaVisible = en.isIntersecting;
        if (en.isIntersecting) self.playLayer('sea', 'sea_waves.mp3', 0.09);
        else self.stopLayer('sea');
      });
    }, { threshold: 0.25 });
    io.observe(img); this._seaObserver = io;
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
    box.addEventListener('click', function () { if (self._modemGo) self._modemGo(); });
    mask.tabIndex = 0; mask.setAttribute('aria-label', '跳过拨号连接');
    mask.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); if (self._modemGo) self._modemGo(); } });
    mask.focus();
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
    if (e.target && e.target.closest && e.target.closest('#speaker-btn')) return;
    AudioEngine.unlock();
  });
  document.addEventListener('keydown', function () { AudioEngine.unlock(); });
  /* 移动端：touchstart 兜底解锁（真实设备的触摸即受信手势） */
  document.addEventListener('touchstart', function (e) {
    if (e.target && e.target.closest && e.target.closest('#speaker-btn')) return;
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
    if (pager && href && href.indexOf('javascript') !== 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0) {
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

/* Hydrate only the current thread page or the unlocked album. */
var RuntimeImages = {
  activate:function(container){
    container.querySelectorAll('img[data-src]').forEach(function(img){img.src=img.getAttribute('data-src');img.removeAttribute('data-src');});
  }
};

/* Accessible overlays, optional help, and browsing preferences. No page layout changes. */
AudioEngine.syncLocalMedia = function () {
  var self=this, playing=this.enabled && !document.hidden && !this._pageHidden;
  Object.keys(this.layers).forEach(function(name){
    var layer=self.layers[name]; if(!layer.media) return;
    layer.media.volume=self.enabled ? layer.volume*0.9 : 0;
    if(!playing) layer.media.pause(); else layer.media.play().catch(function(){});
  });
  [this.localStinger,this.localOneShot].forEach(function(media){if(media && !playing) media.pause();});
};
var RuntimeUI = {
  shade:null, hintLevel:0,
  read:function(key,fallback){return GameStorage.get(key,fallback);},
  write:function(key,value){GameStorage.set(key,value);},
  applyQuiet:function(on,persist){document.documentElement.classList.toggle('runtime-quiet',on);document.documentElement.classList.toggle('runtime-motion',!on);if(persist)this.write('shengxia_quiet_v2',on?'1':'0');},
  dialog:function(title){
    if(this.shade) this.shade.close();
    var previous=document.activeElement, shade=document.createElement('div'), box=document.createElement('div');
    var oldOverflow=document.documentElement.style.overflow, frozen=[];
    Array.prototype.forEach.call(document.body.children,function(el){if(el.tagName==='SCRIPT')return;frozen.push({el:el,inert:el.inert,hidden:el.getAttribute('aria-hidden')});el.inert=true;el.setAttribute('aria-hidden','true');});
    document.documentElement.style.overflow='hidden';
    shade.className='runtime-shade';box.className='runtime-dialog';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','runtime-title');
    shade.cleanups=[];
    var close=document.createElement('button');close.type='button';close.className='runtime-close';close.textContent='关闭';close.setAttribute('aria-label','关闭对话框');
    var heading=document.createElement('h2');heading.id='runtime-title';heading.textContent=title;
    box.appendChild(close);box.appendChild(heading);shade.appendChild(box);document.body.appendChild(shade);
    var self=this;
    shade.close=function(){shade.cleanups.forEach(function(fn){fn();});shade.remove();frozen.forEach(function(x){x.el.inert=x.inert;if(x.hidden===null)x.el.removeAttribute('aria-hidden');else x.el.setAttribute('aria-hidden',x.hidden);});document.documentElement.style.overflow=oldOverflow;if(self.shade===shade)self.shade=null;document.removeEventListener('focusin',containFocus,true);if(previous&&previous.isConnected&&!previous.disabled)previous.focus({preventScroll:true});};
    function containFocus(e){if(!box.contains(e.target))close.focus({preventScroll:true});}
    document.addEventListener('focusin',containFocus,true);
    close.onclick=shade.close;shade.onclick=function(e){if(e.target===shade)shade.close();};
    shade.addEventListener('keydown',function(e){
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();shade.close();return;}
      if(e.key==='Tab'){
        var list=Array.prototype.filter.call(box.querySelectorAll('button,a[href],input,select,[tabindex="0"]'),function(el){return el.offsetWidth>0&&!el.disabled;});
        var first=list[0],last=list[list.length-1];
        if(!box.contains(document.activeElement)){e.preventDefault();first.focus();return;}
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
    this.shade=shade;close.focus({preventScroll:true});return box;
  },
  hints:function(){
    var p=location.pathname;
    if(/\/album\//.test(p)){
      var gate=document.getElementById('gate');
      if(gate&&gate.style.display!=='none') return ['密码和栀栀的生日有关。','论坛的生日帖和妈妈的微语都记着同一天。','六月十二日，可以按四位数字填写。'];
      return ['相册不只留下了照片，末尾还有一行归档信息。','归档号可以拿回千度搜索，不需要再猜新的相册密码。','搜索相册末尾的完整归档号，就能查到对应存档。'];
    }
    if(/\/hospital\//.test(p)) return ['这里是救助名单，记录不会在这一页继续展开。','她住院前后的痕迹，还留在聊天、画画帖和相册里。','归档号在相册最下方。找到后，可以用千度搜索。'];
    if(/\/chat\//.test(p)) return ['左侧的分组可以展开，也可以切换联系人。','妈妈的主页链接通向微语，聊天里还提过相册密码。','生日是六月十二日；如果在找后来的消息，看看“陌生人”分组。'];
    if(/\/weiyu\//.test(p)) return ['妈妈在这里记下了栀栀的生日。','六月十二日那条记录，和相册的密码有关。','回到论坛签名档中的相册，试试四位生日数字。'];
    if(/\/forum\/thread/.test(p)) return ['画画帖共有五页，末页的留言和前面不太一样。','楼主的签名档里有相册和讯聊入口。','聊天中的妈妈主页能找到生日，相册需要这个日期。'];
    if(/\/forum\/pet-post/.test(p)) return ['这张帖子记录的是花卷后来的生活。','它是补充记录，读完后可以回到之前的网页继续找栀栀的痕迹。','如果还没找到存档说明，可以看看相册末尾的归档号。'];
    if(/\/forum\//.test(p)) return ['画画帖之外，还保存着借物、签到和课间闲聊。','同一个网名在不同帖子里说过的话，可以放在一起看。','画画区的打卡帖签名档里有相册和聊天入口。'];
    if(/\/search\//.test(p)){
      var kw=document.getElementById('kw'),q=kw?kw.value:'';
      if(/20120817|归档|存档/.test(q)) return ['归档号可以直接搜索，空格和下划线不会影响匹配。','找到“存档说明”这一条，不是已失效的个人快照。','如果还没记下编号，相册最下方保留着完整归档号。'];
      return ['可以搜索报纸上见过的名字、猫名和机构。','搜“花卷走丢”可以找到画画帖；搜全名也有相关记录。','如果已经解开相册，可以试着搜索相册末尾的归档号。'];
    }
    if(/\/newspaper\//.test(p)) return ['报纸中缝有寻猫启事，校园版也留着一个名字。','页面下方的“千度搜索”可以查这些内容。','可以试试“花卷走丢”或作文作者的姓名。'];
    return ['目录里有一个标记为异常的夏季镜像。','它在目录最下方，可以打开。','打开“2012_summer”就能进入滨城晚报。'];
  },
  unavailable:function(a){
    var title=(a.textContent||'存档功能').trim(),box=this.dialog(title),text=document.createElement('p');
    text.textContent=a.getAttribute('data-unavailable')||(title==='转发'?'这是只读存档，不能向原网站提交转发。原文和已留存的评论仍可浏览。':title==='***'?'这位用户没有留下公开昵称，镜像只存有这一条转发，没有个人主页。':'这项在线服务或个人主页没有收入镜像。这里不接受登录、报名、付款或资料提交；关闭此窗口即可继续浏览原页。');box.appendChild(text);
  },
  showHint:function(){
    var box=this.dialog('一点提示'), text=document.createElement('p'), more=document.createElement('button'),self=this;
    var steps=this.hints(), level=0;text.textContent=steps[0];text.setAttribute('aria-live','polite');
    more.textContent='再具体一点';more.type='button';more.onclick=function(){level++;text.textContent=steps[Math.min(level,steps.length-1)];if(level>=steps.length-1)more.disabled=true;};
    box.appendChild(text);box.appendChild(more);
  },
  settings:function(){
    var self=this,box=this.dialog('浏览选项');
    function check(text,on,change,key){var label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=on;input.dataset.runtimeOption=key;input.onchange=function(){change(input.checked);};label.appendChild(input);label.appendChild(document.createTextNode(text));box.appendChild(label);}
    check('关闭广告闪烁',document.documentElement.classList.contains('runtime-quiet'),function(on){self.applyQuiet(on,true);},'quiet');
    check('播放声音',AudioEngine.enabled,function(on){if(AudioEngine.enabled!==on)AudioEngine.toggle();},'audio');
    var note=document.createElement('p');note.className='runtime-status';note.textContent=(GameStorage.persistent?'选项会保存在当前浏览器。':GameStorage.session?'当前仅能保存本次会话的进度。':'当前浏览器无法保存进度，关闭页面后需要重新探索。')+'图片可点开缩放，按 Esc 关闭。';box.appendChild(note);
    if(this.read(GameState.KEY,'0')==='1'){
      var year=document.createElement('button');year.type='button';year.textContent=GameState.is2013()?'回看2012年报纸':'查看2013年报纸';
      year.onclick=function(){GameStorage.tabSet('shengxia_view_year_v2',GameState.is2013()?'2012':'2013');location.href=rootPrefix()+'newspaper/index.html';};box.appendChild(year);
    }
  },
  refresh:function(resume){
    this.applyQuiet(this.read('shengxia_quiet_v2','1')!=='0');
    AudioEngine.loadPref();AudioEngine.applyPlaybackState(resume);AudioEngine.updateSpeakerIcon();
    if(this.shade){var audio=this.shade.querySelector('[data-runtime-option=audio]'),quiet=this.shade.querySelector('[data-runtime-option=quiet]');if(audio)audio.checked=AudioEngine.enabled;if(quiet)quiet.checked=document.documentElement.classList.contains('runtime-quiet');}
    if(!document.hidden&&GameState.is2013()!==this.renderedYear)location.reload();
  },
  saveChat:function(){
    var shell=document.querySelector('.qq-shell');if(!shell)return;
    var state=this.chatState||(this.chatState={scrolls:{},groups:{}}),panel=shell.querySelector('.chat-panel:not(.hidden-panel)');
    if(panel){state.panel=panel.id;var log=panel.querySelector('.chat-log');if(log)state.scrolls[panel.id]=log.scrollTop;}
    shell.querySelectorAll('.group').forEach(function(group){state.groups[group.id]=!group.classList.contains('collapsed');});
    GameStorage.tabSet('shengxia_chat_view',JSON.stringify(state));
  },
  restoreChat:function(){
    var shell=document.querySelector('.qq-shell');if(!shell||typeof window.showPanel!=='function')return;
    var self=this,state=null;
    try{state=JSON.parse(GameStorage.tabGet('shengxia_chat_view')||'null');}catch(e){}
    this.chatState={scrolls:{},groups:{}};
    shell.querySelectorAll('.chat-panel').forEach(function(panel){
      var value=state&&state.scrolls&&Number(state.scrolls[panel.id]);
      if(Number.isFinite(value)&&value>=0)self.chatState.scrolls[panel.id]=value;
    });
    shell.querySelectorAll('.group').forEach(function(group){
      var expanded=state&&state.groups&&state.groups[group.id];
      if(typeof expanded==='boolean'){group.classList.toggle('collapsed',!expanded);group.querySelector('.arrow').textContent=expanded?'▾':'▸';group.querySelector('.group-head').setAttribute('aria-expanded',String(expanded));}
      group.querySelector('.group-head').addEventListener('click',function(){self.saveChat();});
    });
    var originalShow=window.showPanel;
    function applyPanel(pid){
      var panel=document.getElementById(pid),log=panel&&panel.querySelector('.chat-log');
      if(log)log.scrollTop=self.chatState.scrolls[pid]||0;
      shell.querySelectorAll('.contact').forEach(function(el){el.setAttribute('aria-pressed',String(el.dataset.panel===pid));});
      shell.querySelectorAll('.chat-panel').forEach(function(el){el.setAttribute('aria-hidden',String(el.id!==pid));});
    }
    var contact=state&&Array.prototype.find.call(shell.querySelectorAll('.contact'),function(el){return el.dataset.panel===state.panel;});
    if(contact){
      var group=contact.closest('.group');if(!state.groups||typeof state.groups[group.id]!=='boolean'){group.classList.remove('collapsed');group.querySelector('.arrow').textContent='▾';group.querySelector('.group-head').setAttribute('aria-expanded','true');}
      originalShow(state.panel,contact);applyPanel(state.panel);
    }else applyPanel('panel-mom');
    window.showPanel=function(pid,el){self.saveChat();originalShow(pid,el);applyPanel(pid);self.saveChat();};
    var timer=null;
    shell.querySelectorAll('.chat-log').forEach(function(log){log.addEventListener('scroll',function(){clearTimeout(timer);timer=setTimeout(function(){self.saveChat();},120);},{passive:true});});
  },
  localPath:function(raw){
    try{
      var root=new URL(rootPrefix()||'./',location.href),url=new URL(raw,location.href);
      if(url.protocol!==root.protocol||url.host!==root.host||url.pathname.indexOf(root.pathname)!==0)return null;
      var relative=url.pathname.slice(root.pathname.length);
      var allowed=['index.html','newspaper/index.html','search/index.html','search/result.html','forum/index.html','forum/thread.html','forum/pet-post.html','chat/index.html','weiyu/index.html','album/index.html','hospital/index.html','archive/index.html','catalog.html','forum/reading.html','newspaper/reading.html','hospital/reading.html'];
      return allowed.indexOf(relative)>=0?relative+url.search+url.hash:null;
    }catch(e){return null;}
  },
  prepareDeadLink:function(a){
    var from=location.pathname+location.search+location.hash;
    if(!this.localPath(location.href))from=this.localPath(new URLSearchParams(location.search).get('from')||'')||'index.html';
    a.href=rootPrefix()+'404.html?from='+encodeURIComponent(from);
  },
  rememberReturn:function(){
    var path=this.localPath(location.href);if(!path)return;
    GameStorage.tabSet('shengxia_return_v3',JSON.stringify({path:path,x:scrollX,y:scrollY,time:Date.now(),returning:false,tables:Array.prototype.map.call(document.querySelectorAll('.table-scroll'),function(el){return {x:el.scrollLeft,y:el.scrollTop};})}));
  },
  returnState:function(){try{var state=JSON.parse(GameStorage.tabGet('shengxia_return_v3')||'null');return state&&Date.now()-state.time<86400000?state:null;}catch(e){return null;}},
  restoreReturn:function(){
    var state=this.returnState();if(!state||!state.returning||state.path!==this.localPath(location.href))return;
    function restore(){
      document.querySelectorAll('.table-scroll').forEach(function(el,i){var saved=state.tables&&state.tables[i];if(saved){el.scrollLeft=Number(saved.x)||0;el.scrollTop=Number(saved.y)||0;}});
      window.scrollTo(Number(state.x)||0,Number(state.y)||0);
    }
    if(document.readyState==='complete')requestAnimationFrame(restore);else window.addEventListener('load',function(){requestAnimationFrame(restore);},{once:true});
    GameStorage.tabSet('shengxia_return_v3',null);
  },
  photo:function(el,image){
    var box=this.dialog(image.alt||'查看图片');box.classList.add('runtime-photo');
    var controls=document.createElement('div'),stage=document.createElement('div'),large=image.cloneNode();
    controls.className='runtime-zoom-controls';stage.className='runtime-image-viewport';stage.tabIndex=0;stage.setAttribute('aria-label','图片查看区域，可滚动查看放大的图片');large.removeAttribute('style');large.loading='eager';stage.appendChild(large);box.appendChild(controls);box.appendChild(stage);
    var zoom=1,fit=0,status=document.createElement('span');status.className='runtime-status';status.setAttribute('aria-live','polite');
    function button(label,fn){var b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;controls.appendChild(b);return b;}
    var less=button('缩小',function(){zoom=Math.max(1,zoom/1.5);render();});
    var more=button('放大',function(){zoom=Math.min(5,zoom*1.5);render();});
    button('适合窗口',function(){zoom=1;fit=0;render();stage.scrollTop=stage.scrollLeft=0;});controls.appendChild(status);
    function render(){
      if(!large.naturalWidth)return;
      if(!fit)fit=Math.min(stage.clientWidth,large.naturalWidth,innerHeight*0.57*large.naturalWidth/large.naturalHeight);
      large.style.width=Math.round(fit*zoom)+'px';large.style.maxWidth='none';large.style.maxHeight='none';
      status.textContent=Math.round(zoom*100)+'%';less.disabled=zoom<=1;more.disabled=zoom>=5;
    }
    large.onload=render;if(large.complete)render();
    function resized(){fit=0;render();}
    window.addEventListener('resize',resized);this.shade.cleanups.push(function(){window.removeEventListener('resize',resized);});
    stage.addEventListener('keydown',function(e){if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='+'||e.key==='='){e.preventDefault();more.click();}else if(e.key==='-'){e.preventDefault();less.click();}else if(e.key==='0'){e.preventDefault();zoom=1;render();}});
    var drag=null;stage.addEventListener('pointerdown',function(e){if(zoom<=1||e.pointerType==='touch'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);e.preventDefault();});
    stage.addEventListener('pointermove',function(e){if(drag){stage.scrollLeft=drag.left+drag.x-e.clientX;stage.scrollTop=drag.top+drag.y-e.clientY;}});stage.addEventListener('pointerup',function(){drag=null;});stage.addEventListener('pointercancel',function(){drag=null;});large.draggable=false;
    var cap=el.parentNode.querySelector('.photo-cap'),overlay=el.querySelector&&el.querySelector('.wrist-overlay,.sea-hint');
    var caption=document.createElement('p');caption.textContent=(cap?cap.textContent:'')+(overlay?'　'+overlay.textContent:'');if(caption.textContent)box.appendChild(caption);
  },
  boot:function(){
    var link=document.createElement('link');link.rel='stylesheet';link.href=rootPrefix()+'css/interaction.css';document.head.appendChild(link);
    this.applyQuiet(this.read('shengxia_quiet_v2','1')!=='0');
    this.renderedYear=GameState.is2013();
    var self=this,b=document.createElement('button');b.id='runtime-settings';b.type='button';b.className='runtime-tool';b.textContent='选项';b.onclick=function(){self.settings();};document.body.appendChild(b);
    var speaker=document.getElementById('speaker-btn');
    function speakerState(){if(speaker){speaker.setAttribute('aria-label',AudioEngine.enabled?'关闭声音':'打开声音');speaker.setAttribute('aria-pressed',AudioEngine.enabled?'true':'false');}}
    var originalIcon=AudioEngine.updateSpeakerIcon;AudioEngine.updateSpeakerIcon=function(){originalIcon.call(this);speakerState();};speakerState();
    document.querySelectorAll('.contact,.group-head,.failed-mark,#sea-frame,.emo-panel span[onclick],.win-btns span[onclick]').forEach(function(el){el.tabIndex=0;el.setAttribute('role','button');if(el.classList.contains('group-head'))el.setAttribute('aria-expanded',el.parentNode.classList.contains('collapsed')?'false':'true');el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});el.addEventListener('click',function(){if(el.classList.contains('group-head'))el.setAttribute('aria-expanded',el.parentNode.classList.contains('collapsed')?'false':'true');});});
    document.querySelectorAll('input[name=q],#kw').forEach(function(input){if(!input.getAttribute('aria-label'))input.setAttribute('aria-label','搜索旧网页');});
    document.querySelectorAll('.photo-frame,.sea-pic,.post-body img.draw').forEach(function(el){
      var image=el.tagName==='IMG'?el:el.querySelector('img');if(!image)return;
      if(!el.hasAttribute('tabindex')){el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','查看大图：'+image.alt);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});}
      el.addEventListener('click',function(){self.photo(el,image);});
    });
    document.querySelectorAll('a.dead').forEach(function(a){self.prepareDeadLink(a);});
    function prepareReturn(e){var a=e.target.closest&&e.target.closest('a.dead');if(a){self.rememberReturn();self.prepareDeadLink(a);}}
    document.addEventListener('pointerdown',prepareReturn);
    document.addEventListener('contextmenu',prepareReturn);
    var source=document.getElementById('return-source');
    if(source){
      var from=new URLSearchParams(location.search).get('from')||'',path=self.localPath(from);
      source.href=path||'index.html';
      source.addEventListener('click',function(){var state=self.returnState();if(state&&state.path===path){state.returning=true;GameStorage.tabSet('shengxia_return_v3',JSON.stringify(state));}});
    }
    document.querySelectorAll('a.archive-unavailable').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();self.unavailable(a);});a.addEventListener('keydown',function(e){if(e.key===' '){e.preventDefault();a.click();}});});
    this.restoreReturn();
    document.addEventListener('click',function(e){var win=e.target.closest&&e.target.closest('.popup-win');if(win){var x=win.querySelector('.x');if(x){x.tabIndex=0;x.setAttribute('role','button');x.setAttribute('aria-label','关闭广告');}}});
    document.addEventListener('keydown',function(e){var win=document.querySelector('.popup-win');if(win&&e.key==='Escape'){e.preventDefault();win.querySelector('button').click();}});
    document.addEventListener('visibilitychange',function(){if(document.hidden)self.saveChat();self.refresh(!document.hidden);});
    window.addEventListener('pagehide',function(){AudioEngine._pageHidden=true;AudioEngine.applyPlaybackState(false);self.saveChat();});
    window.addEventListener('pageshow',function(){AudioEngine._pageHidden=false;self.refresh(false);if(AudioEngine.inited)AudioEngine.applyPlaybackState(true);});
    window.addEventListener('storage',function(e){if(e.key===AudioEngine.KEY||e.key==='shengxia_quiet_v2'||e.key===GameState.KEY)self.refresh(false);});
    this.restoreChat();
    document.querySelectorAll('form').forEach(function(form){
      var input=form.querySelector('input[name="q"]');if(!input)return;
      var composing=false;
      input.addEventListener('compositionstart',function(){composing=true;});
      input.addEventListener('compositionend',function(){composing=false;input.setCustomValidity('');});
      form.addEventListener('submit',function(e){if(composing){e.preventDefault();return;}if(!input.value.trim()){e.preventDefault();input.setCustomValidity('请输入要搜索的内容');input.reportValidity();input.focus();}});
      input.addEventListener('input',function(){input.setCustomValidity('');});
    });

  }
};
document.addEventListener('DOMContentLoaded',function(){RuntimeUI.boot();});
