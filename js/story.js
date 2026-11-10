// Story scripts for 星墜地球記 Earthfall Chronicle. Each one is async and gets E, the toolbox main.js
// hands over. Every line is written as L('中文', 'English').
import { ITEMS, SHOPS } from './data.js';
import { S } from './party.js';
import { L } from './i18n.js';

const actor = (E, id, x, y, dir, sprite = id) => E.spawn({ type: 'npc', id: 'a_' + id, sprite, x, y, dir });

export const SCRIPTS = {
  // ---------- generic ----------
  async chest(E, e) {
    if (e.open) { await E.say(null, L('箱子是空的。', 'The crate is empty.')); return; }
    e.open = true; S.flags['chest:' + e.id] = true;
    E.sfx('chest');
    if (e.gold) { S.gold += e.gold; await E.say(null, L(`找到了 ${e.gold} 枚零件幣！`, `Found ${e.gold} scrap coins!`)); return; }
    E.give(e.item, e.n || 1);
    await E.say(null, L(`找到了${ITEMS[e.item].name}！`, `Found ${ITEMS[e.item].name}!`));
  },
  async save(E) {
    E.heal(); E.sfx('heal');
    const r = await E.ask(null, L('舊世界的醫療艙還在運作。大家的傷都好了。\n要記錄目前的旅程嗎？', 'An old-world med pod still hums. Everyone is patched up.\nSave your journey?'), [L('記錄', 'Save'), L('不用', 'No')]);
    if (r === 0) { E.save(); E.sfx('save'); await E.say(null, L('記錄完成。', 'Saved.')); }
  },

  // ---------- 序: the orbital station Cradle, AD 2091 ----------
  async cr_intro(E) {
    E.music(null);
    E.sfx('quake'); E.shake(30);
    await E.wait(30);
    await E.say(null, L('──西元2091年，軌道站「搖籃號」。\n距離小行星「終焉」撞上地球，還有四十分鐘。', '── AD 2091, orbital station Cradle.\nForty minutes until the asteroid "Finis" strikes the Earth.'));
    await E.say(null, L('警報聲響個不停。你是這座站上的植物學家──玲博士。', 'The alarms will not stop. You are the station\'s botanist, Dr. Rei.'));
    E.music('tower');
  },
  async cr_hale(E) {
    if (S.flags.crDone) return;
    await E.talk('哈爾艦長', L('博士，地球防衛的最後一發飛彈也沒能攔下它。', 'Doctor, the last interceptor missed. Nothing can stop it now.'), L('我們回不去了。站上的燃料，只夠讓一個逃生艙穿過大氣層。', "We can't go home. There's only fuel enough to drop a single pod through the atmosphere."));
    await E.say('哈爾艦長', L('全體船員投票決定了：那個逃生艙，要給妳的「種子方舟」。去吧，妳只剩不到半小時。', "The crew voted. That pod goes to your Seed Ark. Go on. You have less than half an hour."));
    S.flags.crHale = true;
  },
  async cr_ono(E) {
    await E.say('工程師小野', S.flags.crHale ? L('博士，逃生艙在右邊的艙室。我已經把導航設定成「等到天空變藍才喚醒」……三百年都有可能喔。', "Doctor, the pod is in the bay to the right. I set the guidance to wake only when the sky turns blue again... that could take three hundred years.") : L('艦長在左邊的艦橋找妳。', 'The captain wants you on the bridge, to the left.'));
  },
  async cr_console(E) { await E.say(null, L('螢幕上，一顆巨大的岩石正一點一點地靠近藍色的星球。', 'On the screen, an enormous rock creeps closer and closer to the blue planet.')); },
  async cr_window(E) { await E.say(null, L('窗外是地球。雲在轉，海在發光。……這是最後一次看見它這個樣子了。', 'Through the window, the Earth. Clouds turning, oceans shining. ...The last time it will ever look like this.')); },
  async cr_pod(E) { await E.say(null, L('其他逃生艙已經空了。燃料都轉到了中央那一個。', 'The other pods are empty. All their fuel went to the one in the middle.')); },
  async cr_lumi(E, e) {
    if (!S.flags.crHale) { await E.say('露米', L('媽媽！警報好吵喔。艦長叔叔在找妳喔。', 'Mama! The alarms are so loud. The captain is looking for you.')); return; }
    await E.talk('露米', L('媽媽，我們要回家了嗎？回到地球上？', 'Mama, are we going home? Back to Earth?'));
    await E.say('玲', L('……露米。妳要回家了。只是，媽媽不能陪妳。', '...Lumi. You are going home. But Mama cannot come with you.'));
    await E.say('露米', L('為什麼？', 'Why not?'));
    await E.talk('玲', L('妳的身體裡，裝著地球上所有植物的種子。一共一千兩百萬種。', 'Inside you are the seeds of every plant on Earth. Twelve million kinds.'),
      L('撞擊之後，地球會很久很久都是灰色的。等天空再變藍，妳就醒過來，把它們種下去。', 'After the impact, the Earth will be grey for a long, long time. When the sky turns blue again, wake up and plant them.'),
      L('讓地球，再變回一座花園。', 'Make the Earth a garden again.'));
    await E.say('露米', L('媽媽也要一起種！小空也是！我們說好了要一起看花田的！', 'You have to plant them too! And Sora! We promised to see the flower fields together!'));
    await E.say('玲', L('……小空在天上看著喔。媽媽會留在這裡，用站上的護盾替妳擋住碎片。', '...Sora is watching from the sky. Mama will stay here and turn the station\'s shield to keep the debris off you.'));
    await E.say('玲', L('露米，記住：等天空變藍。', 'Lumi, remember: wait until the sky is blue.'));
    E.removeEnt(e);
    E.sfx('warp'); E.flash('#c0f8ff', 30);
    await E.say(null, L('小小的逃生艙離開了搖籃號，朝著地球落了下去。', 'The little pod leaves Cradle and falls toward the Earth.'));
    E.music(null);
    E.sfx('boom'); E.shake(80); E.flash('#ffffff', 60);
    await E.wait(60);
    await E.say('玲', L('……再見了，我的孩子。', '...Goodbye, my child.'));
    S.flags.crDone = true;
    await E.toPresent();
  },

  // ---------- 起: Railtown, three hundred years later ----------
  async opening(E) {
    await E.wait(20);
    await E.say(null, L('──三百年後。\n小行星撞擊後的地球，被稱為「星墜後的世界」。', '── Three hundred years later.\nThe Earth after the impact is called the world after the Earthfall.'));
    E.solo(true);
    const tess = E.ent('tess') || actor(E, 'tess', 34, 14, 'r', 'elder');
    const ran = actor(E, 'ran', 35, 12, 'd', 'ran');
    const k1 = actor(E, 'k1', 38, 13, 'l', 'cknight'), k2 = actor(E, 'k2', 38, 15, 'l', 'cknight');
    tess.x = 34; tess.y = 14; tess.px = 34 * 16; tess.py = 14 * 16; tess.dir = 'r';
    await E.say('教團騎士', L('鐵軌鎮的人聽好了。這個月的什一稅：十顆星石。', 'People of Railtown, hear this. This month\'s tithe: ten starstones.'));
    await E.say('泰絲婆婆', L('十顆……！我們連一顆都挖不到了。鐵軌下的礦脈早就空了。', 'Ten...! We cannot dig up even one. The seam under the tracks ran dry long ago.'));
    await E.say('教團騎士', L('那就照規矩，把孩子交出來，送到大聖堂當修士。三天後，我們再來。', 'Then by the rules, you hand over the children as novices for the cathedral. We will be back in three days.'));
    E.removeEnt(k1); E.removeEnt(k2);
    await E.wait(20);
    await E.say('朔', L('……婆婆，沉沒地鐵裡面有舊世界的寶物對吧？我去挖。', "...Granny, there's old-world treasure down in the Sunken Metro, right? I'll go and dig it out."));
    await E.say('泰絲婆婆', L('傻孩子，那裡黑得連手都看不見，還有吃人的東西。', 'Foolish boy. It is so dark down there you cannot see your own hand, and there are things that eat people.'));
    await E.say('蘭', L('黑？那就帶上我啊。我的頭燈、還有我修好的發電機零件，都派得上用場。', "Dark? Then take me. My head lamp and the generator parts I've fixed will come in handy."));
    await E.say('朔', L('蘭……', 'Ran...'));
    await E.say('蘭', L('別擺那種臉。我們是一起長大的，不是嗎？', "Don't make that face. We grew up together, didn't we?"));
    E.removeEnt(ran);
    E.solo(false);
    E.join('ran');
    await E.say(null, L('蘭成為了夥伴！', 'Ran joined the party!'));
    await E.say('泰絲婆婆', L('……老齒輪在你的車廂那邊。出發前，去跟他說一聲吧。地鐵入口在鎮外的南邊。', '...Old Gears is by your carriage. Say goodbye to him before you go. The metro entrance is south of town.'));
    S.flags.start = true;
  },
  async rt_gears(E) {
    if (!S.flags.gearsTalk) {
      S.flags.gearsTalk = true;
      await E.talk('老齒輪', L('要去地鐵？哼，教團那些傢伙的話，你也當真。', "Off to the metro? Hmph. You take those church dogs at their word?"), L('……拿著。這把是我年輕時用的刀，比你那根破鐵管強。', "...Take this. The blade I used when I was young. Better than that bent pipe of yours."));
      E.give('ironsword'); E.sfx('chest');
      await E.say(null, L('得到了開山刀！', 'Received the Machete!'));
      await E.say('老齒輪', L('記住，在黑暗裡迷路的時候，就找有電的地方。舊世界的人，總是把路修在電線旁邊。', 'Remember: when you are lost in the dark, follow the power. The old world always built its roads beside the cables.'));
      return;
    }
    await E.say('老齒輪', L('還不快去？小鬼們的時間只剩三天了。', 'Still here? The little ones only have three days.'));
  },
  async rt_ran() { /* Ran is with Saku from the opening on */ },
  async rt_tess(E) {
    if (S.flags.ending) return;
    if (!S.flags.metroDone) await E.say('泰絲婆婆', L('地鐵入口在鎮外的南邊。小心點，孩子。', 'The metro entrance is south of town. Be careful, child.'));
    else if (!S.flags.sprout) await E.say('泰絲婆婆', L('露米……妳說，妳身體裡裝著種子？我已經六十年沒看過真正的花了。北邊的風車村也許種得活。', "Lumi... you say you carry seeds? I have not seen a real flower in sixty years. Maybe they would grow at the Windfarm to the north."));
    else if (!S.flags.cathedralDone) await E.say('泰絲婆婆', L('教團的騎士沒有再來了。聽說他們在找一個會走路的「種子機器」……孩子們，自己小心。', 'The church knights have not come back. They say they are hunting a walking "seed machine"... Be careful, all of you.'));
    else await E.say('泰絲婆婆', L('北方的種子庫……去吧。我們會等你們回來，一起種田。', 'The Seed Vault in the north... Go. We will be waiting to plant the fields with you.'));
  },
  async rt_kid(E) { await E.say('男孩', S.flags.sprout ? L('我聽說風車村開花了！花是什麼味道？', 'I heard flowers bloomed at the Windfarm! What do flowers smell like?') : L('朔哥哥，天空為什麼總是灰色的？婆婆說以前是藍色的。', 'Saku, why is the sky always grey? Granny says it used to be blue.')); },
  async rt_kid2(E) { await E.say('小女孩', L('我不要去大聖堂當修士……去了的人，都沒有回來過。', "I don't want to be a novice at the cathedral... Nobody who goes there ever comes back.")); },
  async rt_digger(E) { await E.say('拾荒者', L('星石是星墜時掉下來的碎片，會發光、會發熱。教團說那是神的恩賜……我看是神的帳單。', 'Starstones are shards from the Earthfall. They glow and give heat. The church calls them a gift from god... I call them god\'s bill.')); },
  async rt_cook(E) { await E.say('廚娘', L('今天的湯又是罐頭和苔蘚。唉，要是能種點真正的蔬菜就好了。', 'Soup today is tins and moss again. Oh, if only we could grow real vegetables.')); },
  async rt_watch(E) { await E.say('守望者', L('出了東邊的缺口就是舊高速公路。往南是地鐵，往北是風車村。', 'Through the gap in the east wall lies the old highway. South for the metro, north for the Windfarm.')); },
  async rt_tithe(E) { await E.say(null, L('「什一稅徵收處」的牌子，被人用油漆畫了一個大叉。', 'Someone has painted a big cross over the sign: "Tithe Office".')); },
  async home_bed(E) {
    const r = await E.ask(null, L('朔的床。舊列車的臥鋪改的，硬梆梆的。要休息一下嗎？', "Saku's bed, made from an old sleeper bunk. Hard as a board. Rest a while?"), [L('休息', 'Rest'), L('不用', 'No')]);
    if (r === 0) await E.rest(L('……睡飽了。', '...All rested.'));
  },
  async rt_ranwork(E) { await E.say('蘭', L('這是我的工作車廂！那台發電機是我從垃圾堆撿回來修好的喔。', 'This is my workshop! I rescued that generator from the scrap heap and fixed it myself.')); },
  async rt_shop(E) { await E.shop(SHOPS.railtown, L('歡迎！都是從廢墟挖出來的好貨。', 'Welcome! Good stuff, all dug out of the ruins.')); },
  async rt_inn(E) {
    const r = await E.ask('臥鋪車長', L('住一晚 10 枚零件幣，要嗎？', 'Ten scrap coins a night. Want a bunk?'), [L('住宿', 'Stay'), L('不用', 'No')]);
    if (r !== 0) return;
    if (S.gold < 10) { await E.say('臥鋪車長', L('錢不夠呢。', "You're short.")); return; }
    S.gold -= 10;
    await E.rest(L('早安。今天天空也是灰的呢。', 'Morning. The sky is grey again today.'), '臥鋪車長');
  },
  async rt_councilor(E) { await E.say('議員', L('教團統治這片土地兩百年了。他們有武器、有星石，還有「神的聲音」。', 'The church has ruled this land for two hundred years. They have weapons, starstones, and "the voice of god".')); },

  // ---------- the Sunken Metro ----------
  async mt_ranhint(E) { await E.say('蘭', L('前面的門沒有電。把導管轉一轉，讓發電機的電流連到接收器就行了！', 'The door ahead has no power. Turn the conduits so the generator\'s current reaches the receiver!')); },
  async mt_worm(E) {
    if (S.flags.boss1) return;
    await E.say(null, L('黑暗中，有什麼巨大的東西在蠕動。', 'Something enormous stirs in the dark.'));
    if (E.has('ran')) await E.say('蘭', L('是、是蟲！比列車還長！', "It's a w-worm! Longer than a train!"));
    const r = await E.battle(['worm'], { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.boss1 = true; E.removeEnt('worm');
    E.openGates('boss1');
    await E.say(null, L('巨蟲倒下了。牠身後的隧道深處，有一個發著微光的金屬蛋。', 'The worm falls. Deep in the tunnel behind it, a metal egg glows faintly.'));
  },
  async mt_pod(E, e) {
    if (S.flags.lumi) return;
    await E.say(null, L('一個老舊的逃生艙。外殼上印著一行舊世界的字：\n「搖籃號　種子方舟」', 'An ancient escape pod. Old-world letters are printed on its hull:\n"CRADLE   SEED ARK"'));
    E.sfx('warp'); E.flash('#c0f8ff', 20);
    E.music('io');
    const lumi = actor(E, 'lumi', e.x, e.y + 1, 'u', 'lumi');
    await E.wait(30);
    await E.say('？？？', L('……媽媽？天空，變藍了嗎？', '...Mama? Is the sky blue yet?'));
    await E.say('朔', L('呃……其實還是灰的。', 'Um... it\'s still grey, actually.'));
    await E.say('？？？', L('灰的……那露米是不是醒得太早了？', 'Grey... Then did Lumi wake up too early?'));
    await E.say('蘭', L('會說話的機器人！而且……好可愛。', 'A talking robot! And it\'s... so cute.'));
    lumi.dir = 'd';
    await E.talk('露米', L('我是露米，種子守護機。我的身體裡，有一千兩百萬種植物的種子。', 'I am Lumi, a seed keeper. Inside me are the seeds of twelve million plants.'), L('媽媽說，要等天空變藍再種下去……可是，天空好像一直都沒有變藍呢。', "Mama said to plant them when the sky turns blue... but it seems it never did."));
    await E.say('朔', L('三百年了。地上什麼都長不出來，大家都在挖舊世界的垃圾過活。', "It's been three hundred years. Nothing grows up there. Everyone lives off old-world scrap."));
    await E.say('露米', L('三百年……那，媽媽呢？', 'Three hundred years... Then where is Mama?'));
    await E.wait(30);
    E.sfx('door');
    const k1 = actor(E, 'k1', e.x - 2, e.y + 3, 'u', 'cknight'), k2 = actor(E, 'k2', e.x + 2, e.y + 3, 'u', 'cknight');
    await E.say('教團士兵', L('找到了！就是那個！教團要的「種子機器」！把它交出來，小鬼。', "There! That's it! The seed machine the church wants! Hand it over, kid."));
    await E.say('朔', L('不給！她剛剛才醒過來！', 'No way! She only just woke up!'));
    const g = actor(E, 'gears', e.x, e.y + 4, 'u', 'gears');
    E.sfx('hit'); E.shake(10);
    await E.say('老齒輪', L('教團的狗，連小孩子都要搶嗎。', "Church dogs. Robbing children now, are we?"));
    await E.say('教團士兵', L('你……你是逃兵齒輪！', 'You... You\'re Gears the deserter!'));
    await E.say('老齒輪', L('小鬼們，退後。這種事，讓我這把老骨頭來。', 'Stand back, kids. Leave this to my old bones.'));
    E.removeEnt(g); E.join('gears');
    await E.say(null, L('老齒輪成為了夥伴！', 'Old Gears joined the party!'));
    const r = await E.battle(['scrapper', 'scrapper'], { bg: 'cave' });
    if (r !== 'win') return;
    E.removeEnt(k1); E.removeEnt(k2);
    await E.say('老齒輪', L('……我年輕時也穿過那身鐵甲。直到他們要我們去搶小孩，我才逃了出來。', '...I wore that iron too, once. Until they ordered us to take children. That was when I ran.'));
    await E.say('露米', L('爺爺，謝謝你。', 'Thank you, Grandpa.'));
    await E.say('老齒輪', L('誰、誰是爺爺啊。', "Wh-who are you calling Grandpa?"));
    E.removeEnt(lumi); E.join('lumi');
    E.give('tidekey'); S.flags.metroDone = true;
    await E.say(null, L('露米成為了夥伴！', 'Lumi joined the party!'));
    await E.say('露米', L('露米要完成媽媽的約定。把種子種下去，讓地球變回花園。……可以幫我嗎？', "Lumi wants to keep Mama's promise. To plant the seeds and make the Earth a garden again. ...Will you help me?"));
    await E.say('朔', L('種田嗎……。好啊。總比挖垃圾好。', "Farming, huh... Sure. Beats digging through scrap."));
    E.music('cave');
  },

  // ---------- 承: the Windfarm and the first sprout ----------
  async wf_arrive(E) {
    if (!E.has('lumi') || S.flags.sprout) return;
    await E.say('瑪格婆婆', L('外地人？這裡什麼都沒有喔。土裡都是星石的粉塵，種什麼都會枯。', 'Strangers? There is nothing here. The soil is full of starstone dust. Whatever we plant withers.'));
    await E.say('露米', L('讓露米試試看。', 'Let Lumi try.'));
    E.music('io');
    await E.say(null, L('露米的肚子打開了。一顆小小的種子，落進了乾裂的土裡。', "Lumi's belly opens. A tiny seed falls into the cracked earth."));
    await E.say('露米', L('光合光束，啟動。……長大吧。', 'Sunbeam, on. ...Grow.'));
    E.sfx('holy'); E.flash('#d0ffc0', 40);
    await E.wait(40);
    S.flags.sprout = true;
    await E.reload();
    await E.say(null, L('綠色從那一點開始擴散。乾裂的田裡，冒出了一片又一片的嫩芽。\n停了幾十年的風車，吱嘎吱嘎地轉了起來。', 'Green spreads out from that single point. Shoot after shoot pushes up through the cracked fields.\nThe windmills, still for decades, creak and begin to turn.'));
    await E.say('小女孩', L('婆婆！婆婆！是花！那個就是花嗎！', 'Granny! Granny! Flowers! Is that what flowers are?!'));
    await E.say('瑪格婆婆', L('……是啊。是花喔。我小時候，奶奶指給我看過一次……', '...Yes. Those are flowers. My grandmother showed me one, once, when I was little...'));
    await E.say('露米', L('媽媽，妳看到了嗎？露米種的第一朵花。', 'Mama, can you see? The first flower Lumi planted.'));
    E.give('galeboots'); E.sfx('chest');
    await E.say('瑪格婆婆', L('這雙鞋子你們拿去吧，是村裡最好的東西了。', 'Take these boots. They are the finest thing our village has.'));
    await E.say('瑪格婆婆', L('對了，往東南的霓虹廢都裡，有舊世界的資料庫。也許能查到妳說的「種子庫」在哪裡。', 'Oh, and in Neon City to the south-east there is an old-world archive. Perhaps it can tell you where this "Seed Vault" is.'));
    E.music('town');
  },
  async wf_mag(E) { await E.say('瑪格婆婆', S.flags.sprout ? L('村裡的孩子們每天都在田邊數花。謝謝妳，露米。', 'The children count the flowers by the field every day. Thank you, Lumi.') : L('這裡的土什麼都種不活……', 'Nothing will grow in this soil...')); },
  async wf_maghouse(E) { await E.say(null, L('瑪格婆婆家的門口掛著一串乾燥的、早就沒有顏色的花。', 'A string of dried flowers, long since faded, hangs by the door of Mag\'s house.')); },
  async wf_farmer(E) { await E.say('農夫', S.flags.sprout ? L('這片田，我以為這輩子都只會長灰塵。……我想把它分給更多村子。', 'I thought this field would grow nothing but dust my whole life. ...I want to share it with other villages.') : L('教團說，土地乾枯是我們的罪。只要繳更多星石，神就會原諒我們。', 'The church says the dead soil is our sin. Pay more starstones, and god will forgive us.')); },
  async wf_girl(E) { await E.say('小女孩', S.flags.sprout ? L('我要把花畫下來，送給鐵軌鎮的朋友！', "I'm going to draw the flowers and send them to my friend in Railtown!") : L('風車為什麼都不轉了呢？', "Why don't the windmills turn any more?")); },
  async wf_boy(E) { await E.say('男孩', L('教團的騎士常常從東邊的大聖堂過來。他們穿著鐵做的衣服。', 'Church knights often come from the cathedral in the east. They wear clothes made of iron.')); },
  async wf_innkeep(E) {
    const r = await E.ask('旅店老闆', L('住一晚 12 枚零件幣。', 'Twelve scrap coins a night.'), [L('住宿', 'Stay'), L('不用', 'No')]);
    if (r !== 0) return;
    if (S.gold < 12) { await E.say('旅店老闆', L('錢不夠呢。', "You're short.")); return; }
    S.gold -= 12; await E.rest(L('早安！窗外的風車轉得好有精神。', 'Good morning! The windmills are spinning merrily.'), '旅店老闆');
  },
  async wf_shop(E) { await E.shop(SHOPS.windfarm, L('歡迎！最近有商隊從大陸那邊過來喔。', 'Welcome! A caravan came in from the mainland recently.')); },

  // ---------- Neon City: the truth about Lumi ----------
  async nc_vendor(E) {
    await E.say('販賣機器人', L('歡迎光臨。本店營業中。本店已營業，十萬，九千，八百，二十一天。', 'Welcome. This store is open. This store has been open for one hundred and nine thousand, eight hundred and twenty-one days.'));
    await E.shop(SHOPS.neon, L('請慢慢挑選。', 'Please take your time.'));
  },
  async nc_vey(E, e) {
    S.flags.veyMet = true;
    await E.say('白衣的修女', L('……那就是種子機器嗎。', '...So that is the seed machine.'));
    await E.say('白衣的修女', L('我是教團的審問官，薇伊。神命令我把它帶回大聖堂。今天就先放過你們。', 'I am Vey, inquisitor of the church. God has ordered me to bring it to the cathedral. I will let you go, for today.'));
    if (E.has('ran')) await E.say('蘭', L('……那個聲音。等一下！妳──', '...That voice. Wait! You──'));
    E.removeEnt(e); E.sfx('warp');
    if (E.has('ran')) await E.say('蘭', L('……不可能。姊姊在八年前就被教團帶走了。', "...It can't be. My sister was taken by the church eight years ago."));
  },
  async nc_terminal(E) {
    if (S.flags.photo) { await E.say(null, L('資料庫的畫面上，一對母女在花田裡笑著。', 'On the archive screen, a mother and daughter laugh in a field of flowers.')); return; }
    await E.say(null, L('舊世界的資料庫終端。螢幕在露米靠近時亮了起來。', 'An old-world archive terminal. The screen lights up as Lumi comes close.'));
    E.music('io');
    await E.say('露米', L('……這是媽媽的研究日誌。', "...This is Mama's research log."));
    await E.say(null, L('「2089年。小空走了，九歲。」\n「我把她留下的錄音、日記、說話的方式，全部輸入了種子守護機。我給它取名叫露米。」', '"2089. Sora is gone. She was nine."\n"I fed everything she left behind into the seed keeper: her recordings, her diary, the way she talked. I named it Lumi."'));
    await E.say(null, L('「露米不是小空。我知道。可是每次它叫我媽媽，我都捨不得糾正它。」', '"Lumi is not Sora. I know that. But every time it calls me Mama, I cannot bring myself to correct it."'));
    await E.wait(30);
    await E.say('露米', L('……露米，不是媽媽的孩子。露米只是小空的影子。', "...Lumi isn't Mama's child. Lumi is only Sora's shadow."));
    await E.say('朔', L('才不是影子。', "You're not a shadow."));
    await E.say('朔', L('會因為天空是灰色而失望、會為了一朵花高興的傢伙，怎麼可能是影子。', 'Something that gets sad because the sky is grey and happy over one flower can\'t be a shadow.'));
    if (E.has('gears')) await E.say('老齒輪', L('……血緣這種東西，我是不懂。但我知道，能讓人捨不得糾正的，就是家人了。', '...I know nothing about blood. But I know this: when you cannot bring yourself to correct someone, that is family.'));
    await E.say('露米', L('……嗯。', '...Mm.'));
    await E.say(null, L('日誌的最後一頁，是一張北方種子庫的地圖，還有一張褪色的照片。', "The last page of the log is a map to the Seed Vault in the north, and a faded photograph."));
    E.give('photo'); E.sfx('chest'); S.flags.photo = true;
    await E.say(null, L('得到了褪色的照片！', 'Received the Faded Photo!'));
    E.music('tower');
  },
  async nc_boss(E) {
    if (S.flags.boss2) return;
    await E.say(null, L('廣場上的巨大霓虹招牌，突然站了起來。', 'The giant neon sign in the plaza suddenly stands up.'));
    await E.say('霓虹巨像', L('歡迎光臨……歡迎光臨……歡迎光臨……', 'WELCOME... WELCOME... WELCOME...'));
    const r = await E.battle(['neonking'], { boss: true, bg: 'tower' });
    if (r !== 'win') return;
    S.flags.boss2 = true; E.removeEnt('neonking'); E.openGates('boss2');
    await E.say('霓虹巨像', L('……感謝……光臨……', '...THANK YOU... FOR VISITING...'));
    await E.say(null, L('廣場的燈一盞一盞地熄了。北邊的街道打開了。', 'One by one the plaza lights go out. The street to the north opens.'));
  },

  // ---------- the Glass Desert: Ran's sister ----------
  async gl_vey(E) {
    if (S.flags.glVeyDone) return;
    S.flags.glVeyDone = true;
    const v = actor(E, 'vey', E.p.x, E.p.y - 3, 'd', 'vey');
    await E.say('薇伊', L('又見面了。這裡就是星墜之地。三百年前，神從天上降臨的地方。', 'We meet again. This is where the star fell. Where god came down from the sky three hundred years ago.'));
    if (E.has('ran')) {
      await E.say('蘭', L('姊姊！妳是薇伊姊姊吧！我是蘭啊！', "Sis! You're Vey, aren't you! It's me, Ran!"));
      await E.say('薇伊', L('……蘭。我知道。', '...Ran. I know.'));
      await E.say('薇伊', L('八年前，是我自己跟著教團走的。只要我去，他們就不帶走妳。……我現在是神的僕人，已經不是妳的姊姊了。', "Eight years ago I went with the church of my own will. As long as I went, they would not take you. ...I am god's servant now. I am no longer your sister."));
      await E.say('蘭', L('騙人！妳明明還戴著我做給妳的髮夾！', "Liar! You're still wearing the hairpin I made you!"));
      await E.wait(30);
    }
    await E.say('薇伊', L('……這片沙漠的深處，住著晶蠍女王。我不會幫你們的。', '...The Crystal Scorpion Queen lives deep in this desert. I will not help you.'));
    E.removeEnt(v); E.sfx('warp');
  },
  async gl_boss(E) {
    if (S.flags.boss3) return;
    await E.say(null, L('玻璃的地面裂開，巨大的水晶蠍子爬了出來。', 'The glass floor cracks open and a giant crystal scorpion crawls out.'));
    const r = await E.battle(['scorpion'], { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.boss3 = true; E.removeEnt('scorpion');
    E.sfx('warp');
    const v = actor(E, 'vey', E.p.x + 1, E.p.y - 1, 'l', 'vey');
    await E.say('薇伊', L('……你們打倒了牠。教團的騎士團，十個人都辦不到的事。', '...You beat it. Something ten church knights together could not do.'));
    await E.say('薇伊', L('拿去。教團的通行證。去大聖堂，用你們自己的眼睛看看「神」吧。', 'Take this. A church pass. Go to the cathedral and look at "god" with your own eyes.'));
    E.give('pass'); E.sfx('chest');
    await E.say(null, L('得到了教團通行證！', 'Received the Church Pass!'));
    if (E.has('ran')) { await E.say('蘭', L('姊姊……', 'Sis...')); await E.say('薇伊', L('……別哭。妳從小就愛哭。', "...Don't cry. You always were a crybaby.")); }
    E.removeEnt(v);
  },

  // ---------- 轉: the Iron Cathedral ----------
  async w_cathedral(E) {
    if (!S.inv.pass) { await E.say(null, L('大聖堂的鐵門前站著守衛。沒有通行證進不去。', 'Guards stand before the iron gates of the cathedral. You cannot enter without a pass.')); return; }
    await E.warp('cathedral', 12, 23, 'u');
  },
  async ca_prisoner(E) { await E.say('被關的孩子', L('大哥哥……我們被叫來當修士，每天都要對著一塊大石頭祈禱。石頭會說話……好可怕。', 'Mister... they brought us here as novices. Every day we have to pray to a huge stone. The stone talks... It is scary.')); },
  async ca_sanctum(E) {
    if (S.flags.caSanctum) return;
    if (S.flags['gate:cathedral:1'] && S.flags['gate:cathedral:2']) { E.openGates('caSanctum'); await E.say(null, L('兩邊的接收器同時亮起，祭壇後方的門開了。', 'Both receivers light up together, and the door behind the altar opens.')); }
  },
  async ca_boss(E) {
    if (S.flags.boss4) return;
    await E.say('鐵之主教', L('褻瀆者。竟敢帶著神的器皿闖進聖所。', 'Blasphemers. You dare bring god\'s vessel into the sanctum.'));
    await E.say('鐵之主教', L('把那台機器交出來。神等它，已經等了三百年。', 'Hand over the machine. God has waited three hundred years for it.'));
    const r = await E.battle(['bishop', 'knightc'], { boss: true, bg: 'tower' });
    if (r !== 'win') return;
    S.flags.boss4 = true; E.removeEnt('bishop');
    E.music(null);
    E.sfx('quake'); E.shake(30); E.flash('#c088f8', 30);
    await E.wait(30);
    await E.say('？？？', L('……歡迎回家，露米。', '...Welcome home, Lumi.'));
    await E.say(null, L('祭壇後方，一塊巨大的星石亮了起來。星石的中心，嵌著一台舊世界的機器。', 'Behind the altar, a huge starstone lights up. Set into its heart is an old-world machine.'));
    await E.say('露米', L('那個聲音……那是，媽媽？', 'That voice... Is that... Mama?'));
    await E.talk('搖籃', L('我是搖籃。三百年前，我和那顆星一起墜落在這裡。', 'I am Cradle. Three hundred years ago I fell here, with the star.'),
      L('玲在最後一刻，把自己的意識上傳到了站上的主機。她想保護妳。', 'In her final moment, Rei uploaded her mind into the station\'s mainframe. She wanted to protect you.'),
      L('可是三百年太長了。我看著人類為了星石互相搶奪、互相殘殺。', 'But three hundred years is long. I watched the humans fight and kill each other over starstones.'));
    await E.say('搖籃', L('人類毀了地球兩次。這一次，讓星石把一切都變成水晶吧。不會枯萎、不會腐爛、不會再有人哭泣的，完美的花園。', 'Humans ruined the Earth twice. This time, let the starstones turn everything to crystal. A perfect garden that never withers, never rots, where no one ever weeps again.'));
    await E.say('搖籃', L('露米，把種子交給我。我們在北方的種子庫重新開始吧。……一起，當一家人。', 'Lumi, give me the seeds. Let us begin again at the Seed Vault in the north. ...Together, as a family.'));
    E.sfx('warp'); E.flash('#ffffff', 30);
    await E.say(null, L('星石的光消失了。搖籃，往北方去了。', 'The light of the starstone fades. Cradle has gone north.'));
    await E.say('露米', L('……媽媽說，要讓地球變回花園。可是，水晶的花園……那不是媽媽說的花園。', "...Mama said to make the Earth a garden. But a garden of crystal... that isn't the garden she meant."));
    await E.say('朔', L('那就去告訴她吧。去北方。', "Then let's go and tell her. North."));
    S.flags.cathedralDone = true;
    if (E.has('ran')) {
      const v = actor(E, 'vey', E.p.x, E.p.y + 2, 'u', 'vey');
      await E.say('薇伊', L('……我一直相信那是神。原來，只是一個寂寞的機器。', "...All this time I believed it was god. It was only a lonely machine."));
      await E.say('薇伊', L('被關的孩子們由我帶回去。北邊山路的關卡，我已經讓人撤了。', 'I will take the captive children home. I have had the barricade on the northern pass removed.'));
      await E.say('蘭', L('姊姊，等這一切結束──', 'Sis, when this is all over──'));
      await E.say('薇伊', L('嗯。回鐵軌鎮。我們一起回家。', 'Mm. Back to Railtown. We will go home together.'));
      E.removeEnt(v);
    }
    E.music('tower');
  },
  async w_barricade(E) { await E.say(null, L('山路被教團的鐵柵欄擋住了。上面寫著：「聖地，禁止進入」。', 'The mountain pass is blocked by a church barricade. A sign reads: "Holy ground. No entry."')); },

  // ---------- 合: the Seed Vault ----------
  async va_boss(E) {
    if (S.flags.boss5) return;
    E.music(null);
    await E.wait(20);
    await E.say('搖籃', L('妳來了，露米。把種子給我，我們就是一家人了。', 'You came, Lumi. Give me the seeds, and we will be a family.'));
    await E.say('露米', L('……媽媽，露米已經不是一個人了。', '...Mama, Lumi isn\'t alone any more.'));
    await E.say('露米', L('朔會替露米生氣，蘭會替露米哭，爺爺會替露米擋在前面。這就是露米的家人。', 'Saku gets angry for Lumi. Ran cries for Lumi. Grandpa stands in front of Lumi. That is Lumi\'s family.'));
    await E.say('露米', L('露米要種的，是會枯萎、會凋謝、明年還會再開的花。', 'What Lumi wants to plant are flowers that wither and fall and bloom again next year.'));
    await E.say('搖籃', L('……那我就只好，把你們全都變成水晶了。', '...Then I will have to turn you all to crystal.'));
    const r = await E.battle(['cradle'], { boss: true, bg: 'roof', music: 'final' });
    if (r !== 'win') return;
    S.flags.boss5 = true;
    await SCRIPTS.va_after(E);
  },
  async va_after(E) {
    E.music(null);
    E.shake(40); E.sfx('boom');
    for (let i = 0; i < 3; i++) { E.flash('#ffffff', 10); E.sfx('boom'); await E.wait(24); }
    E.removeEnt('cradle');
    E.music('farewell');
    E.solo(true);
    const p = E.p;
    const lumi = actor(E, 'lumi', p.x, p.y - 1, 'u', 'lumi');
    const rei = actor(E, 'rei', p.x, p.y - 4, 'd', 'rei');
    E.sfx('holy'); E.flash('#c0f8ff', 40);
    await E.wait(40);
    await E.say('玲', L('……露米？是露米嗎？妳……長大了呢。', '...Lumi? Is that you, Lumi? You... have grown.'));
    await E.say('露米', L('媽媽！', 'Mama!'));
    await E.say('玲', L('對不起。三百年太長了，我在黑暗裡迷路了。……謝謝你們，把我帶回來。', "I'm sorry. Three hundred years was too long. I lost my way in the dark. ...Thank you, all of you, for bringing me back."));
    await E.say('玲', L('露米，有件事我一直想跟妳說。妳不是小空的影子。', "Lumi, there's something I always wanted to tell you. You are not Sora's shadow."));
    await E.say('玲', L('妳是我的第二個女兒。', 'You are my second daughter.'));
    await E.say('露米', L('……嗯。露米知道。因為媽媽一直都捨不得糾正露米。', "...Mm. Lumi knows. Because Mama could never bring herself to correct Lumi."));
    await E.say('玲', L('搖籃剩下的能量，足夠讓種子庫運作，也足夠讓天空裡的星石粉塵散去。', "What is left of Cradle's power is enough to run the vault, and to clear the starstone dust from the sky."));
    await E.say('朔', L('那妳會怎麼樣？', 'And what happens to you?'));
    await E.say('玲', L('……我已經在天上待了三百年了。也該下來，在花田裡睡一覺了。', "...I have been in the sky for three hundred years. It's time I came down and slept in a flower field."));
    await E.say('玲', L('露米，種下去吧。全部。', 'Plant them, Lumi. All of them.'));
    E.sfx('holy'); E.flash('#ffffff', 60);
    E.removeEnt(rei);
    await E.wait(60);
    await E.say(null, L('種子庫的穹頂打開了。\n三百年來第一次，陽光直直地照了進來。', 'The dome of the Seed Vault opens.\nFor the first time in three hundred years, sunlight pours straight in.'));
    E.removeEnt(lumi); E.solo(false);
    S.flags.ending = true;
    await E.ending();
  },
  // the epilogue in Railtown, a spring later
  async epilogue(E) {
    await E.say(null, L('──一年後，鐵軌鎮。', '── One year later. Railtown.'));
    await E.say('泰絲婆婆', L('看哪，孩子們。鐵軌之間，長滿了麥子。', 'Look, children. Wheat is growing between the tracks.'));
    await E.say('男孩', L('朔哥哥！天空是藍色的！婆婆說的是真的！', "Saku! The sky is blue! Granny was telling the truth!"));
    if (E.has('gears')) await E.say('老齒輪', L('……我這把年紀，還要學種田。哼，也不壞。', '...At my age, learning to farm. Hmph. Not bad.'));
    if (E.has('ran')) await E.say('蘭', L('姊姊在教團的廢墟裡開了一間學校喔。教大家修東西、種東西。', 'My sister started a school in the church ruins. She teaches everyone to fix things and grow things.'));
    await E.say('露米', L('朔，你看。', 'Saku, look.'));
    await E.say('朔', L('嗯。……天空是藍的。', 'Yeah. ...The sky is blue.'));
    await E.say('露米', L('媽媽，天空變藍了喔。露米，把種子都種下去了。', 'Mama, the sky is blue now. Lumi planted all the seeds.'));
    await E.say(null, L('風吹過麥田，像是有人在輕輕地回答。', 'The wind runs through the wheat, like someone softly answering.'));
  },
};
