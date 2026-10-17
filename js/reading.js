(function(){
 'use strict';
 var data=SummerReading,kind=window.READING_KIND,params=new URLSearchParams(location.search),root=document.getElementById('reading-root'),heading=document.getElementById('site-heading');
 var board=params.get('board'),pet=kind==='forum'&&board==='pet'&&!params.get('post'),site=pet?'pet':kind;
 window.SITE_ID=site;
 var sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=rootPrefix()+'css/reading-'+site+'.css';document.head.appendChild(sheet);
 if(pet)document.body.className='reading-pet';
 function n(tag,text,cls){var el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
 function a(label,path){var el=n('a',label);el.href=rootPrefix()+path;return el;}
 function add(parent,child){parent.appendChild(child);return child;}
 function text(parent,s){parent.appendChild(document.createTextNode(s));}
 function links(parent,items,cls){if(!items||!items.length)return;var row=add(parent,n('div',undefined,cls||'reading-links'));items.forEach(function(item,i){if(i)text(row,'　｜　');add(row,a(item[0],item[1]));});return row;}
 function paras(parent,items){items.forEach(function(t){add(parent,n('p',t));});}
 function crumb(parent,items,label){var bar=add(parent,n('div',undefined,'crumb')),inner=add(bar,n('div',undefined,'wrap'));text(inner,'您所在的位置：');items.forEach(function(x){add(inner,a(x[0],x[1]));text(inner,' > ');});text(inner,label);}
 function unavailable(parent){var box=add(parent,n('p',undefined,'reading-status'));text(box,'此编号未收入本次留存。下方列出可浏览页面。');}
 var post=params.get('post'),record=data.records.find(function(r){return r.id===post&&r.kind===kind;});
 var homes={forum:'forum/index.html',pet:'forum/reading.html?board=pet',news:'newspaper/index.html',hospital:'hospital/reading.html',catalog:'index.html'};
 var names={forum:'向日葵论坛',pet:'滨城宠物之家',news:'滨城晚报',hospital:'滨城儿童医院',catalog:'中国旧网页档案馆'};
 document.title=(record?record.title:pet?'猫咪乐园':kind==='forum'?(data.boards[board]||'主题存档'):kind==='news'?'版面目录':kind==='hospital'?'医院首页':'镜像网站目录')+' - '+names[site];
 function table(parent,items,labels){var scroll=add(parent,n('div',undefined,'table-scroll')),t=add(scroll,n('table',undefined,site==='catalog'?'dir-table':'grid native-list')),thead=add(t,n('thead')),h=add(thead,n('tr'));labels.forEach(function(x){add(h,n('th',x));});var body=add(t,n('tbody'));items.forEach(function(r){var tr=add(body,n('tr')),td=add(tr,n('td'));add(td,a(r.title,r.path));add(tr,n('td',r.author));add(tr,n('td',r.date));});return t;}
 function forum(){
  var head=add(heading,n('header',undefined,pet?'pet-header':'tb-header')),wrap=add(head,n('div',undefined,'wrap'));add(wrap,n('span',names[site],pet?'pet-logo':'tb-logo'));
  links(wrap,pet?[['猫咪乐园',homes.pet]]:[['论坛首页',homes.forum],['主题存档','forum/reading.html'],['版务公告','forum/reading.html?board=notice']],'native-header-nav');
  var valid=board&&board!=='pet'&&Object.prototype.hasOwnProperty.call(data.boards,board),label=pet?'猫咪乐园':record?record.title:valid?data.boards[board]:'主题存档';
  var trail=[[names[site],homes[site]]];if(record&&record.board)trail.push([data.boards[record.board],'forum/reading.html?board='+record.board]);crumb(heading,trail,label);
  if(record){
   var title=add(root,n('div',undefined,'thread-title'));add(title,n('h1',record.title));add(title,n('div','楼主：'+record.author+' ｜ 留存回复：'+(record.replies||[]).length+' ｜ 发表于 '+record.date,'thread-meta'));
   function floor(author,date,ps,num){
    var row=add(root,n('section',undefined,'floor')),user=add(row,n('div',undefined,'u-col')),hao=author==='耗子不会飞',zhi=author==='栀栀爱画猫';
    add(user,n('div',zhi?'栀':hao?'耗':author.charAt(0),hao?'avatar haozi':'avatar'));var name=add(user,n('div',author,'u-name'));if(author===record.author)add(name,n('span','楼主','lz-badge'));
    add(user,n('div',zhi?'Lv.3 画画小学徒':hao?'Lv.5 水王':author==='版主小葵'?'论坛版主':'注册会员','u-level'));
    if(zhi||hao){var stat=add(user,n('div',undefined,'u-stat'));text(stat,zhi?'发帖：47':'发帖：312');add(stat,n('br'));text(stat,zhi?'回帖：203':'回帖：1876');}
    if(zhi){var sig=add(user,n('div',undefined,'sig'));text(sig,'—— 签名档 ——');add(sig,n('br'));add(sig,a('我的相册屋→','album/index.html'));add(sig,n('br'));add(sig,a('87xxxx612 加我请说花卷','chat/index.html'));}
    var content=add(row,n('div',undefined,'c-col')),meta=add(content,n('div',undefined,'floor-head'));add(meta,n('span',num+'楼','floor-no'));text(meta,date);var body=add(content,n('div',undefined,'post-body'));paras(body,ps);return body;
   }
   var first=floor(record.author,record.date,record.paras,1);links(first,record.links);
   (record.replies||[]).forEach(function(reply,i){floor(reply[0],reply[1],[reply[2]],i+2);});
   var pager=add(root,n('div',undefined,'pager'));add(pager,n('span','共 '+(1+(record.replies||[]).length)+' 楼　'));add(pager,a('返回'+data.boards[record.board],'forum/reading.html?board='+record.board));
   links(root,[['主题存档','forum/reading.html'],['论坛首页',homes.forum]],'reading-actions');
  }else{
   var panel=add(root,n('section',undefined,'native-forum-panel'));add(panel,n('h1',label));
   if(post)unavailable(panel);
   if(!pet){var boards=Object.keys(data.boards).filter(function(id){return id!=='pet';}).map(function(id){return[data.boards[id],'forum/reading.html?board='+id];});links(panel,boards,'reading-boards');}
   var items=pet?[{title:'【老沈】家里的猫一切都好',author:'老沈',date:'2013-08-17',path:'forum/pet-post.html'}]:data.records.filter(function(r){return r.kind==='forum'&&(!valid||r.board===board);});
   if(!pet&&(!valid||board==='draw'))items=[{title:'我的画画打卡！每天更一张～',author:'栀栀爱画猫',date:'2012-03-02',path:'forum/thread.html'}].concat(items);
   table(panel,items,['主题','楼主','发表日期']);
   add(panel,n('p',pet?'本版保留 1 个主题及其回帖。':'此页列出已保存正文的主题；原论坛首页的主题数为停站时统计。','reading-meta'));
  }
 }
 function news(){
  root.classList.add('paper');var top=add(root,n('div','电子报资料库　｜　2012—2013年留存稿件','mast-top')),head=add(root,n('header',undefined,'mast-head'));add(head,n('h1','滨城晚报'));add(head,n('div','— 立足滨城 服务百姓 —','slogan'));
  links(root,[['电子报首页',homes.news],['校园','newspaper/index.html#campus'],['分类广告','newspaper/index.html#ad'],['版面目录','newspaper/reading.html']],'mast-nav');
  var content=add(root,n('div',undefined,'news-reading-content'));
  if(record){
   var section=record.id==='relay'?'校园 · 小荷尖尖角':record.id==='service'?'分类广告 · 便民信息':'民生 · 简讯';
   add(content,n('div','当前位置：电子报 > '+section,'news-location'));
   var columns=add(content,n('div',undefined,'news-reading-columns')),article=add(columns,n('article',undefined,'news-article'));add(article,n('h2',record.title));add(article,n('p','刊登日期：'+record.date+'　来源：'+record.author,'reading-meta'));
   var body=add(article,n('div',undefined,record.id==='relay'?'essay native-essay':'news-copy'));paras(body,record.paras);if(record.id==='relay')add(body,n('p',record.author,'sign'));links(article,record.links);
   var aside=add(columns,n('aside',undefined,'news-column'));add(aside,n('h3','同库阅读'));var ul=add(aside,n('ul'));data.records.filter(function(r){return r.kind==='news'&&r.id!==record.id;}).forEach(function(r){var li=add(ul,n('li'));add(li,a(r.title,r.path));add(li,n('div',r.date,'reading-meta'));});
   links(content,[['返回版面目录','newspaper/reading.html'],['返回电子报',homes.news]],'reading-actions');
  }else{
   add(content,n('h2','版面目录','sec-title'));if(post)unavailable(content);add(content,n('p','按原刊日期查阅留存稿件。合存页面中的日期各依原报保留。','reading-meta'));
   table(content,data.records.filter(function(r){return r.kind==='news';}),['标题','栏目 / 作者','刊登日期']);
  }
 }
 var hospitalNav=[['医院首页','hospital/reading.html'],['医院概况','hospital/reading.html?post=hospital-about'],['科室介绍','hospital/reading.html?post=department'],['公示信息','hospital/index.html'],['就医指南','hospital/reading.html?post=hospital-service'],['预约挂号','hospital/reading.html?post=hospital-service'],['联系我们','hospital/reading.html?section=contact']];
 function hospital(){
  var head=add(heading,n('header',undefined,'hosp-header'));add(head,n('h1','滨城儿童医院'));add(head,n('div','儿 童 至 上 · 服 务 至 上 ｜ 急诊电话：0519-88226617','slogan'));var nav=add(heading,n('nav',undefined,'hosp-nav'));hospitalNav.forEach(function(x){var el=add(nav,a(x[0],x[1]));var current=params.get('section')==='contact'?x[0]==='联系我们':record?x[1]===record.path&&x[0]!=='预约挂号':x[0]==='医院首页';if(current){el.className='cur';el.setAttribute('aria-current','page');}});
  root.classList.add('hosp-body');
  var side=add(root,n('aside',undefined,'hosp-side'));add(side,n('h3','院内信息'));hospitalNav.slice(1,5).forEach(function(x){var p=add(side,n('p'));add(p,a(x[0],x[1]));});add(side,n('h3','网页留存说明'));add(side,n('p','仅供查阅当年页面。'));
  var body=add(root,n('article',undefined,'hospital-copy'));
  if(params.get('section')==='contact'){
   document.title='联系我们 - 滨城儿童医院';add(body,n('h2','联系我们'));add(body,n('p','来源：院办公室　｜　2012-08-10','reading-meta'));
   paras(body,['原站联系电话：0519-88226617。此号码仅作为当年资料保留。','挂号与咨询系统的留存范围，见下方说明。']);links(body,[['就医服务留存说明','hospital/reading.html?post=hospital-service']]);
  }else if(record){
   add(body,n('div','医院首页 > '+(record.id==='department'?'科室介绍':record.id==='aid'?'通知公告':'院内信息'),'reading-meta'));add(body,n('h2',record.title));add(body,n('p','发布时间：'+record.date+'　发布部门：'+record.author,'reading-meta'));paras(body,record.paras);links(body,record.links);
  }else{
   if(post)unavailable(body);
   add(body,n('h2','通知公告'));var ul=add(body,n('ul',undefined,'hospital-notices'));
   [['2012年度第二批先天性心脏病患儿救助名单公示','hospital/index.html'],['童心计划：公示范围与查阅说明','hospital/reading.html?post=aid']].forEach(function(x){var li=add(ul,n('li'));add(li,a(x[0],x[1]));add(li,n('span','　2012-08-10','reading-meta'));});
   add(body,n('h2','科室与就医服务'));paras(body,['已留存的院内介绍与服务说明可从下方查阅。']);links(body,hospitalNav.filter(function(x){return ['医院概况','科室介绍','就医指南'].indexOf(x[0])>=0;}));
  }
  add(root,n('div',undefined,'hosp-clear'));links(root,[['医院首页',homes.hospital],['查阅救助公示','hospital/index.html']],'reading-actions');
 }
 function catalog(){
  var head=add(heading,n('header',undefined,'archive-top'));add(head,n('h1','中国旧网页档案馆'));links(head,[['首页','index.html'],['关于项目','catalog.html?post=about'],['归档标准','catalog.html?post=scope'],['联系我们','catalog.html?post=contact']],'catalog-nav');
  crumb(heading,[['首页','index.html'],['镜像目录','catalog.html']],record?record.title:'滨城地方网页');var panel=add(root,n('section',undefined,'panel'));
  if(record){
   add(panel,n('h2',record.title));var dl=add(panel,n('dl',undefined,'archive-file-meta'));[['文件',record.id+'.html'],['更新',record.date],['来源',record.author],['状态','正文已保存']].forEach(function(x){add(dl,n('dt',x[0]));add(dl,n('dd',x[1]));});
   var article=add(panel,n('article',undefined,'catalog-copy'));paras(article,record.paras);links(panel,record.links);links(panel,[['返回镜像目录','catalog.html'],['返回原站存目','index.html']],'reading-actions');
  }else{
   add(panel,n('h2','2012_summer · 正文镜像目录'));if(post)unavailable(panel);add(panel,n('p','下列站点保留了可浏览内容。完整原站存目仍见档案馆首页。','reading-meta'));
   var scroll=add(panel,n('div',undefined,'table-scroll')),tableEl=add(scroll,n('table',undefined,'dir-table')),th=add(tableEl,n('tr'));['站点 / 页面','保存状态'].forEach(function(t){add(th,n('th',t));});data.sites.filter(function(x){return x[1]!=='index.html';}).forEach(function(x){var tr=add(tableEl,n('tr')),td=add(tr,n('td'));add(td,a(x[0],x[1]));add(tr,n('td','正文及相关记录已保存'));});
   add(panel,n('h3','项目文件'));table(panel,data.records.filter(function(r){return r.kind==='catalog';}),['文件','维护者','更新日期']);
  }
 }
 if(kind==='forum')forum();else if(kind==='news')news();else if(kind==='hospital')hospital();else catalog();
})();
