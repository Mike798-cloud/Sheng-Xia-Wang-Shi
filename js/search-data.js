/* ============================================================
   《盛夏往事》千度搜索数据集 + 同义词模糊匹配
   被 search/result.html 引用（DEPTH=1，主线链接用 ../ 前缀）
   ============================================================ */

var SearchDB = {

  /* ---------- 归一化：全角转半角、去空格、小写 ---------- */
  normalize: function (q) {
    if (!q) return '';
    q = q.toLowerCase();
    q = q.replace(/[！-～]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    });
    q = q.replace(/\s+/g, '');
    return q;
  },

  /* ---------- 主线命中结果 ---------- */
  RESULTS: {
    LOST: {
      t: '我的画画打卡！每天更一张～_向日葵论坛',
      s: '【楼主：栀栀爱画猫】今天又画了一只花卷！……7月23日，我家花卷走丢了，白色的小猫，戴着项圈。各位叔叔阿姨有在江滨小区看到的，请回帖告诉我，重谢！',
      u: 'bincheng.go.cn > 向日葵论坛 > 画画区',
      href: '../forum/thread.html',
      dead: false
    },
    SCHOOL: {
      t: '滨城实验小学2012春季作文比赛获奖公示（转载）',
      s: '2012年春季学期作文比赛获奖名单公示：一等奖《我的小猫花卷》，五年级三班 沈知栀……现把获奖作文全文转载如下，供各位家长参考。',
      u: 'news.bincheng.com > 校园频道 > 转载',
      href: '../newspaper/index.html#campus',
      dead: false
    },
    HOSPITAL: {
      t: '滨城儿童医院2012年度先天性心脏病患儿救助名单公示',
      s: '根据市民政局、卫生局统一安排，我院2012年度先天性心脏病患儿救助工作现已启动，第一批救助名单予以公示，公示期7个工作日，欢迎社会监督。咨询：心内二科。',
      u: 'www.bchospital.com > 通知公告',
      href: '../hospital/index.html',
      dead: false
    },
    PET: {
      t: '【老沈】家里的猫一切都好 - 滨城宠物之家',
      s: '猫养得很好，每天都趴在女儿书桌上睡觉，跟她在家的时候一样。猫粮没断过，她留下的小鱼干我也一直给它留着。各位放心。',
      u: 'pet.home.cn > 猫版 > 帖子',
      href: '../forum/pet-post.html',
      dead: false
    },
    ARCHIVE: {
      t: '存档说明',
      s: '一个普通文件夹的镜像说明文件，无网站导航。——2013.08.17 爸爸留。',
      u: '（本地静态存档页）',
      href: '../archive/index.html',
      dead: false
    },
    /* 沈知栀单搜第2页死快照 */
    SNAPSHOT: {
      t: '沈知栀_个人存档_20120817',
      s: '很抱歉，该页面已删除。　千度快照',
      u: 'web.archive.org / 沈知栀_个人存档_20120817（已失效）',
      href: 'javascript:void(0)',
      dead: true
    }
  },

  /* ---------- 同义词组（按顺序匹配，先具体后宽泛） ---------- */
  GROUPS: [
    {
      id: 'archive',
      triggers: ['沈知栀20120817', '沈知栀20120817', '沈知栀归档', '沈知栀个人存档'],
      resultKey: 'ARCHIVE'
    },
    {
      id: 'school',
      triggers: ['滨城实验小学沈知栀', '沈知栀获奖', '沈知栀作文', '我的小猫花卷'],
      resultKey: 'SCHOOL'
    },
    {
      id: 'hospital',
      triggers: ['滨城儿童医院心内二科', '儿童医院2012救助', '先心病滨城', '先天性心脏病救助滨城', '心内二科'],
      resultKey: 'HOSPITAL'
    },
    {
      id: 'lostcat',
      triggers: ['花卷走丢', '花卷猫滨城', '找猫花卷', '白猫花卷'],
      resultKey: 'LOST'
    },
    {
      id: 'pet',
      triggers: ['花卷后来', '花卷近况', '老沈猫'],
      resultKey: 'PET'
    },
    {
      id: 'schoolweak',
      triggers: ['作文获奖'],
      resultKey: 'SCHOOL'
    },
    {
      id: 'catweak',
      triggers: ['小猫'],
      resultKey: 'SCHOOL'
    },
    {
      id: 'shen',
      triggers: ['沈知栀'],
      resultKey: null,
      special: { snapshot: true }
    }
  ],

  /* ---------- 匹配主入口 ----------
     返回 { result: 置顶结果对象|null, special: {snapshot:bool, related:[...]}|null } */
  match: function(rawQuery) {
    var q=this.normalize(rawQuery),out={result:null,special:null};if(!q)return out;
    var numbers=q.match(/\d+/g)||[],archiveIntent=/归档|存档/.test(q)||numbers.some(function(n){return n.indexOf('20120817')>=0||/^(?:19|20)\d{7,}$/.test(n);});
    var invalid=archiveIntent&&numbers.some(function(n){return n.length>=8&&n!=='20120817'&&n!=='20120817001';});
    if(invalid){out.error='archive_number';return out;}
    if(numbers.some(function(n){return n==='20120817'||n==='20120817001';})){out.result=this.RESULTS.ARCHIVE;return out;}
    var name=/沈知栀|栀栀/.test(q);
    if(name&&/相册|照片|海边|看海|青岛/.test(q)){out.result=this.RESULTS.SEASIDE;return out;}
    if(name&&/画画|绘画|打卡/.test(q)){out.result=this.RESULTS.DRAWINGS;return out;}
    if(/心内|心脏|先心/.test(q)&&/医院|二科|救助|公示/.test(q)){out.result=this.RESULTS.HOSPITAL;return out;}
    if((/花卷/.test(q)&&/后来|近况|近来|现在|怎么样|还好/.test(q))||(/老沈/.test(q)&&/猫|花卷/.test(q))){out.result=this.RESULTS.PET;return out;}
    for(var i=0;i<this.GROUPS.length;i++){
      var g=this.GROUPS[i];
      for(var j=0;j<g.triggers.length;j++){
        if(q.indexOf(this.normalize(g.triggers[j]))>=0){if(g.resultKey)out.result=this.RESULTS[g.resultKey];if(g.special)out.special=g.special;return out;}
      }
    }
    return out;
  },

  /* ---------- 相关搜索词 ---------- */
  RELATED_SPECIAL: ['沈知栀 海边', '沈知栀 画画比赛'],
  RELATED_GENERIC: ['滨城天气预报', '滨城二手房出售', 'QQ皮肤下载', '2012高考分数线', '广场舞教学视频', '滨城人才网招聘', '宠物猫疫苗', '小学生作文范文'],

  /* ---------- 通用无关结果池（>=30 条） ---------- */
  GENERIC: [
    { t: '滨城天气预报今天24小时查询', s: '今天白天多云，午后局部地区有雷阵雨，最低气温25度，最高34度，南风3-4级。滨城市气象台6月18日6时发布。', u: 'www.bincity.gov.cn > 便民服务' },
    { t: '2012年高考分数线公布：理科一本340分', s: '我省2012年普通高校招生录取控制分数线正式公布：文科一本342分，理科一本340分。考生可凭准考证号查询成绩。', u: 'www.jseea.cn > 新闻公告' },
    { t: 'QQ2012正式版官方下载 - 腾讯软件中心', s: 'QQ2012 正式版全新上线！微博面板、好友分组管理、消息同步，体积小速度快，安全无毒。免费下载。', u: 'im.qq.com > 下载中心' },
    { t: '滨城二手房出售信息 - 滨城搜房', s: '江滨小区两室一厅68平简装42万；江洲新村三室两厅108平精装85万。个人房源免中介费，每日更新500套。', u: 'bincheng.eeju.com > 二手房' },
    { t: '膝盖下雨天就疼是怎么回事？_滨城生活论坛', s: '楼主您好，根据您描述的情况，建议先拍个膝关节的X光看看，平时注意保暖，别受凉。我爸以前也是这样，后来坚持贴膏药好了。', u: 'bincheng.go.cn > 健康版' },
    { t: '诺基亚Lumia 800行货最新报价', s: '诺基亚Lumia 800 黑色行货今日报价2899元，送8G内存卡+贴膜。实体店地址：滨城市邮电大楼一楼。', u: 'product.pchome.com > 手机' },
    { t: '舌尖上的中国 第1集 自然的馈赠 高清视频', s: '央视美食纪录片《舌尖上的中国》高清全集在线观看。第一集：云南香格里拉的松茸、浙江衢州的衢州烤饼……', u: 'video.sina.com.cn > 纪录片' },
    { t: '滨城中学2012中考喜报', s: '热烈祝贺我校2012年中考再创佳绩：中考均分623.5分，市一中线上线人数87人，考入省重点高中共142人。', u: 'www.bczx.edu.cn > 校园新闻' },
    { t: '刚毕业女生找行政文员工作 - 滨城人才网', s: '女，22岁，大专学历，计算机专业，熟练办公软件，有半年实习经验。求行政文员、前台类工作，月薪1800以上。', u: 'www.bcjob.cn > 求职信息' },
    { t: '从火车站到滨江公园坐几路车？_知道', s: '坐2路公交车直达，火车站上车，滨江公园站下车，全程约35分钟，票价1元。也可打车，约15元。', u: 'zhidao.qiandu.com > 交通出行' },
    { t: '好看的穿越小说推荐 完结免费阅读', s: '书单整理：《步步惊心》《绾青丝》《梦回大清》……都是完本经典，书荒必备。附在线阅读链接。', u: 'www.hongxiu.com > 言情小说' },
    { t: '招商银行滨城分行网点地址电话', s: '招商银行滨城支行：江洲路128号，电话0519-86660123，营业时间9:00-17:00，周六不办理对公业务。', u: 'yellow.bc114.cn > 金融网点' },
    { t: '2012新款夏装连衣裙 包邮 清仓', s: '韩版雪纺连衣裙，修身显瘦，专柜同款，现价59元包邮！三色可选，M/L/XL码，7天无理由退换。', u: 'item.taobao.com > 女装' },
    { t: '新手养鱼必备知识大全（建议收藏）', s: '养鱼先养水！开缸步骤、水质调节、常见鱼病防治，新手第一次养锦鲤必看的十条经验。', u: 'fish.pet.163.com > 观赏鱼' },
    { t: '滨城图书馆开放时间及续借须知', s: '二楼报刊阅览室开放时间8:30-20:00，少儿阅览室周末延时开放。借书逾期每册每天收费1角，可凭读者证网上续借一次。', u: 'www.bclib.cn > 读者服务' },
    { t: '现在的小学生书包是不是太重了？_家长帮', s: '我家三年级，书包称了一下快12斤了，每天压得肩膀都红了。教育局有没有减负规定啊，真怕孩子驼背。', u: 'jz.pupil.com > 小学家长' },
    { t: '人教版小学语文四年级下册教案 全册', s: '新课标人教版四年级语文下册全套教案，含每课教学目标、重难点、板书设计，一线名师编写，免费下载。', u: 'www.zxxk.com > 语文教案' },
    { t: '广场舞教学视频：最炫民族风 分解动作', s: '滨城广场舞队教学视频，《最炫民族风》正反面分解动作，适合中老年人学习，附音乐下载。', u: 'www.56.com > 短视频' },
    { t: '滨城自来水公司停水通知（6月20日）', s: '因管网检修，6月20日8:00-18:00 江滨小区、江洲路沿线停水，请提前储水。客服电话：0519-86220110。', u: 'www.bcwater.com > 公告' },
    { t: '公务员考试申论技巧：开头结尾怎么写', s: '申论大作文开头三招：引言式、排比式、设问式。结尾切记不要喊口号，回扣材料、升华主题才是正道。', u: 'www.offcn.com > 申论' },
    { t: '家里老人血压高吃什么好？_健康问答', s: '低盐低脂饮食，多吃芹菜、黑木耳，戒烟限酒。如果血压持续偏高，请及时到心内科就诊，不要自行停药。', u: 'jiankang.qiandu.com > 内科' },
    { t: '宠物猫疫苗多久打一次？', s: '幼猫2月龄打第一针猫三联，隔21天一针，共三针，之后每年加强一次。狂犬疫苗三个月以上就可以打。', u: 'pet.home.cn > 养猫知识' },
    { t: '周末自驾游：滨城周边十大农家乐推荐', s: '摘杨梅、吃土菜、住农家乐。第一名：青山湖生态农庄，开车40分钟，柴火鸡一定要点！人均60。', u: 'bbs.autohome.com > 滨城车友' },
    { t: '英语四级听力真题MP3免费下载', s: '2006-2011年大学英语四级听力真题及原文打包下载，含高频词汇表，祝同学们一次通过！', u: 'www.ebigear.com > 四级' },
    { t: '滨城供电局电费查询及网上缴费指南', s: '登录网上营业厅，输入用户编号即可查询近三个月电费，支持网银缴费。故障报修电话：95598。', u: 'www.bcpc.com > 用电服务' },
    { t: '谁知道滨城哪里有修数码相机的？', s: '相机镜头缩不回去了，开机吱吱响。问了两家维修点报价都300起，有没有靠谱一点的地方推荐？', u: 'digi.163.com > 滨城论坛' },
    { t: '定胜糕的做法：江南老式点心', s: '定胜糕是江南一带传统糕点，糯米粉加豆沙馅，蒸笼蒸熟，松软香甜。端午节前后奶奶常做给孩子吃。', u: 'home.meishichina.com > 糕点' },
    { t: '婚纱照外景拍摄基地 优惠套系', s: '江洲婚纱摄影：海边外景套系2999元，含五套服装、30张精修、底片全送，七夕前预订再减300。', u: 'www.jzphoto.com > 特惠' },
    { t: '【转】2012年最新网赚项目 日赚百元不是梦', s: '在家兼职，时间自由，日结工资。只要会上网就会做，名额有限，先到先得。（此广告与本站立场无关）', u: 'ad.qiandu.com > 推广' },
    { t: '滨城实验小学2012年秋季一年级招生通告', s: '招生范围：江滨小区、江洲南路以东。报名时间8月25-26日，须带户口本、预防接种证原件。咨询电话：86223345。', u: 'www.bc.edu.cn > 招生公告' },
    { t: '笔记本键盘保护膜 键盘套 批发', s: '14寸通用键盘膜，防水防尘，十张起批每张2元。淘宝店三天好评钻，量大从优。', u: 'digital.bc114.com > 配件' },
    { t: '儿童绘画入门：蜡笔画怎么教？', s: '教低龄儿童画画不要追求画得像，先让孩子大胆涂色。推荐从画小动物开始，蜡笔选粗杆的更适合小手抓握。', u: 'kid.art.com > 育儿' },
    { t: '关于本小区加装电梯投票结果的通知', s: '业主大会表决结果：同意加装电梯217票，反对63票，弃权38票。已超过三分之二，下一步报街道审批。', u: 'wy.bincheng.go.cn > 江滨小区' },
    { t: '滨城出租车叫车电话及打车软件使用', s: '电召出租车拨打96196，提前半小时预约。试运行的打车软件目前免起步价服务费。', u: 'life.bc114.cn > 出行' },
    { t: '小学生暑假日记300字大全 精品', s: '三年级暑假日记范文：《学骑自行车》《帮妈妈做家务》《去海边玩》……每篇300字左右，供同学参考。', u: 'zuowen.edu.com > 小学作文' },
    { t: '老台式机升级：加内存还是换显卡？', s: '08年的机子，平时就看看网页打打小游戏。大家说再加根2G内存划算，还是凑钱换个新主机？', u: 'bbs.zol.com.cn > 硬件' }
  ]
};

/* The suggestions and results use the same normalization and aliases. */
SearchDB.normalize = function (q) {
  return String(q || '').toLowerCase().replace(/[！-～]/g, function (c) {
    return String.fromCharCode(c.charCodeAt(0) - 65248);
  }).replace(/[\s_\-—·.，,。:：/\\()（）【】\[\]"'“”?!、；;‘’]/g, '');
};
SearchDB.RESULTS.SEASIDE = {t:'栀栀的小相册 · 等出院了画完', s:'栀栀的小相册中留着夏天的照片，还有一张没有画完的海边画。相册仅好友可见，访问需要密码。',u:'album.house.cn > 栀栀的小相册',href:'../album/index.html',date:'2012-08-17'};
SearchDB.RESULTS.DRAWINGS = {t:'栀栀爱画猫 · 我的画画打卡！每天更一张～',s:'画猫、画学校，也画过想象中的海边。楼主在帖子中陆续贴出了自己的画。',u:'bincheng.go.cn > 向日葵论坛 > 画画区',href:'../forum/thread.html',date:'2012-03-02'};
SearchDB.RESULTS.MOM = {t:'晚琴的小日子 - 微语',s:'一个普通妈妈的碎碎念，记录栀栀和家里的日常。',u:'weiyu.com > 晚琴的小日子',href:'../weiyu/index.html',date:'2012-08-16'};
SearchDB.RESULTS.LOST.date='2012-07-28'; SearchDB.RESULTS.SCHOOL.date='2012-06-18';
SearchDB.RESULTS.HOSPITAL.date='2012-08-10'; SearchDB.RESULTS.PET.date='2013-08-17';
SearchDB.RESULTS.ARCHIVE.date='2013-08-17'; SearchDB.RESULTS.SNAPSHOT.date='2012-08-17';
SearchDB.RESULTS.HOSPITAL.s='2012年度第二批先天性心脏病患儿救助名单公示，公示期为2012年8月10日至16日。咨询：心内二科。';
SearchDB.GROUPS = [
 {triggers:['沈知栀归档','沈知栀个人存档','沈知栀存档'],resultKey:'ARCHIVE'},
 {triggers:['沈知栀海边','沈知栀看海','栀栀海边','等出院了画完','我的相册屋'],resultKey:'SEASIDE'},
 {triggers:['沈知栀画画比赛','沈知栀画画','栀栀爱画猫','我的画画打卡','向日葵论坛'],resultKey:'DRAWINGS'},
 {triggers:['晚琴','苏晚琴','栀栀妈妈'],resultKey:'MOM'},
 {triggers:['滨城实验小学沈知栀','沈知栀获奖','沈知栀作文','我的小猫花卷','作文获奖','滨城实验小学'],resultKey:'SCHOOL'},
 {triggers:['滨城儿童医院','儿童医院','先天性心脏病','先心病','心内二科','儿童心脏病','救助名单','救助公示'],resultKey:'HOSPITAL'},
 {triggers:['花卷后来','花卷近况','老沈猫','家里的猫一切都好','花卷还好吗'],resultKey:'PET'},
 {triggers:['花卷走丢','花卷丢了','花卷猫滨城','找猫花卷','白猫花卷','寻猫启事','寻猫','花卷'],resultKey:'LOST'},
 {triggers:['小猫'],resultKey:'SCHOOL'},
 {triggers:['沈知栀','栀栀'],resultKey:'SCHOOL',special:{snapshot:true}}
];
SearchDB.related = function (raw) {
  var q=this.normalize(raw), m=this.match(q);
  if (m.result === this.RESULTS.ARCHIVE) return ['沈知栀','花卷后来','沈知栀 海边'];
  if (m.result === this.RESULTS.HOSPITAL) return ['沈知栀','沈知栀 海边','晚琴的小日子'];
  if (m.result === this.RESULTS.LOST || m.result === this.RESULTS.PET) return ['花卷走丢','花卷后来','沈知栀 作文'];
  if (m.result || (m.special && m.special.snapshot)) return ['沈知栀 海边','沈知栀 画画比赛','沈知栀 作文','花卷后来'];
  return ['花卷走丢','沈知栀','滨城儿童医院'].concat(this.RELATED_GENERIC.slice(0,3));
};
SearchDB.SUGGESTIONS=['花卷走丢','花卷后来','花卷近况','老沈猫','沈知栀','沈知栀 获奖','沈知栀 作文','沈知栀 海边','沈知栀 画画比赛','我的小猫花卷','滨城实验小学','滨城儿童医院','先天性心脏病 救助','心内二科','晚琴的小日子'];

/* Search only opens readable preserved pages; snippets remain visibly snippets. */
(function(){
  var original=SearchDB.match;
  SearchDB.RESULTS.CHAT={t:'讯聊网页记录 · 栀栀的联系人',s:'妈妈和同学发来的消息按日期保留，可以切换联系人查阅。',u:'讯聊 > 网页记录',href:'../chat/index.html',date:'2012-08-14'};
  function result(r){return {t:r.title,s:r.paras[0],u:({forum:'向日葵论坛',news:'滨城晚报',hospital:'滨城儿童医院',catalog:'镜像目录'})[r.kind]+' > 留存正文',href:'../'+r.path,date:r.date};}
  SearchDB.readingResult=result;
  SearchDB.match=function(raw){
    var out=original.call(this,raw),q=this.normalize(raw);if(!q||out.error)return out;
    var complete=(q.match(/\d+/g)||[]).some(function(n){return n==='20120817001';});
    if(out.result===this.RESULTS.ARCHIVE&&!complete)return {result:this.RESULTS.SNAPSHOT,special:{snapshot:true}};
    if(out.result===this.RESULTS.ARCHIVE)return out;
    function pack(items){return {result:items[0],results:items};}
    var birthday=SummerReading.records.find(function(r){return r.id==='birthday';});
    if(/生日|六月十二|6月12|十岁/.test(q))return pack([result(birthday),this.RESULTS.MOM]);
    if(/密码|口令/.test(q)&&/相册|相簿|栀栀|知栀|忘|多少|什么/.test(q))return pack([this.RESULTS.CHAT,this.RESULTS.SEASIDE]);
    if(/讯聊|聊天|qq|87xxxx612|耗子不会飞/.test(q)&&!/下载|皮肤/.test(q))return pack([this.RESULTS.CHAT,this.RESULTS.DRAWINGS]);
    if(/相册|相簿/.test(q))return pack([this.RESULTS.SEASIDE,this.RESULTS.DRAWINGS]);
    if(/住院|复查/.test(q)&&/栀栀|知栀/.test(q))return pack([this.RESULTS.HOSPITAL,this.RESULTS.MOM]);
    if(/周子浩|小浩/.test(q)){
      var relay=SummerReading.records.find(function(r){return r.id==='relay';});
      return pack([result(relay),this.RESULTS.CHAT]);
    }
    if(/^(沈知栀|栀栀)$/.test(q))return {result:this.RESULTS.SCHOOL,results:[this.RESULTS.SCHOOL,this.RESULTS.DRAWINGS,this.RESULTS.MOM],special:{snapshot:true}};
    function score(r){return r.tags.concat([r.title]).reduce(function(n,tag){var t=SearchDB.normalize(tag);return q.indexOf(t)>=0||q.length>=2&&t.indexOf(q)>=0?Math.max(n,Math.min(t.length,q.length)+(q===t?100:0)):n;},0);}
    var matches=SummerReading.records.filter(function(r){return r.kind!=='catalog'&&score(r)>0;}).sort(function(a,b){return score(b)-score(a);});
    if(matches.length){var list=matches.map(result);if(out.result&&!list.some(function(r){return r.href===out.result.href;}))list.push(out.result);return {result:list[0],results:list,special:out.special};}
    var aliases={'2012高考分数线':1,'qq2012下载':2,'滨城二手房':3};
    var generic=Object.prototype.hasOwnProperty.call(aliases,q)?[this.GENERIC[aliases[q]]]:this.GENERIC.filter(function(r){var title=SearchDB.normalize(r.t);return title.indexOf(q)>=0||q.indexOf(title)>=0;});
    if(!out.result&&generic.length)return {result:null,results:generic,special:null,summaryOnly:true};
    return out;
  };
  ['蓝色蜡笔','借物','课间十分钟','广播站','寻猫纸','签到','技术支持','沈先生','静态网页','接力赛','生日','相册密码','讯聊记录'].forEach(function(q){if(SearchDB.SUGGESTIONS.indexOf(q)<0)SearchDB.SUGGESTIONS.push(q);});
  var related=SearchDB.related;
  SearchDB.related=function(raw){var q=this.normalize(raw);if(/密码|口令|生日/.test(q))return ['生日礼物','晚琴的小日子','讯聊记录'];if(/蜡笔|借物/.test(q))return ['生日礼物','课间十分钟','广播站'];if(/沈先生|静态网页|技术支持/.test(q))return ['技术支持','花卷后来','沈知栀'];if(/广播|接力/.test(q))return ['接力赛','周子浩','蓝色蜡笔'];return related.call(this,raw);};
})();
