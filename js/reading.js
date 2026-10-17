(function(){
  'use strict';
  var data=SummerReading,kind=window.READING_KIND,params=new URLSearchParams(location.search),root=document.getElementById('reading-root'),nav=document.getElementById('reading-nav');
  function node(tag,text,cls){var el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
  function link(label,path){var a=node('a',label);a.href=rootPrefix()+path;return a;}
  var homes={forum:'forum/index.html',news:'newspaper/index.html',hospital:'hospital/index.html',catalog:'index.html'};
  nav.appendChild(link('首页',homes[kind]));nav.appendChild(link('存档目录',kind==='catalog'?'catalog.html':kind==='news'?'newspaper/reading.html':kind==='hospital'?'hospital/reading.html':'forum/reading.html'));nav.appendChild(link('千度搜索','search/index.html'));
  function crossLinks(container,items){if(!items||!items.length)return;var p=node('p',undefined,'reading-links');items.forEach(function(item,i){if(i)p.appendChild(document.createTextNode('　｜　'));p.appendChild(link(item[0],item[1]));});container.appendChild(p);}
  function list(items){var scroll=node('div',undefined,'table-scroll'),table=node('table',undefined,'grid reading-list'),head=node('tr');['主题 / 页面','作者 / 来源','日期'].forEach(function(s){head.appendChild(node('th',s));});var thead=node('thead');thead.appendChild(head);table.appendChild(thead);var tbody=node('tbody');items.forEach(function(r){var tr=node('tr'),td=node('td');td.appendChild(link(r.title,r.path));tr.appendChild(td);tr.appendChild(node('td',r.author));tr.appendChild(node('td',r.date));tbody.appendChild(tr);});table.appendChild(tbody);scroll.appendChild(table);root.appendChild(scroll);}
  var post=params.get('post'),record=data.records.find(function(r){return r.id===post&&r.kind===kind;});
  if(post&&!record)root.appendChild(node('p','该编号不在本次留存范围内。可查阅的页面列在下方。','reading-notice'));
  if(record){
    document.title=record.title+' · '+document.querySelector('.reading-header h1').textContent;
    root.appendChild(node('h2',record.title));root.appendChild(node('p',record.date+'　'+record.author,'reading-meta'));
    var article=node('article',undefined,'reading-article');record.paras.forEach(function(s){article.appendChild(node('p',s));});root.appendChild(article);
    crossLinks(root,record.links);
    if(record.replies&&record.replies.length){root.appendChild(node('h3','留存回帖'));record.replies.forEach(function(reply,i){var section=node('section',undefined,'reading-reply');section.appendChild(node('p',(i+2)+'楼　'+reply[0]+'　'+reply[1],'reading-meta'));section.appendChild(node('p',reply[2]));root.appendChild(section);});}
    if(record.board)crossLinks(root,[[data.boards[record.board],'forum/reading.html?board='+record.board]]);
    root.appendChild(link('返回本站目录',kind==='catalog'?'catalog.html':kind==='news'?'newspaper/reading.html':kind==='hospital'?'hospital/reading.html':'forum/reading.html'));
  }else{
    var board=params.get('board'),validBoard=Object.prototype.hasOwnProperty.call(data.boards,board),items=data.records.filter(function(r){return r.kind===kind&&(!validBoard||r.board===board);});
    root.appendChild(node('h2',kind==='forum'?(validBoard?data.boards[board]:'主题存档'):kind==='catalog'?'镜像网站目录':'留存页面目录'));
    root.appendChild(node('p','本次留存的正文列于下方；原站总帖数与目录大小为当年的统计。在线发表及账号服务已关闭。','reading-notice'));
    if(kind==='forum'){
      var boards=node('nav',undefined,'reading-boards');Object.keys(data.boards).forEach(function(id){boards.appendChild(link(data.boards[id],'forum/reading.html?board='+id));});root.appendChild(boards);
      if(!board||board==='draw')crossLinks(root,[['我的画画打卡！每天更一张～','forum/thread.html']]);
      if(board==='pet')crossLinks(root,[['【老沈】家里的猫一切都好','forum/pet-post.html']]);
    }
    if(kind==='catalog')crossLinks(root,data.sites);
    if(items.length)list(items);else if(board!=='pet')root.appendChild(node('p','这个板块本次仅留存上列主题。'));
  }
  root.appendChild(node('p','只读存档，不接受新留言或个人资料提交。','reading-meta reading-end'));
})();
