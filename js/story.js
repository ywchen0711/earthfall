// Story scripts for 星墜地球記 Earthfall Chronicle. Each one is async and gets E, the toolbox main.js
// hands over (say, battle, warp ...). Every line is written as L('中文', 'English').
import { ITEMS, SHOPS, TROOPS } from './data.js';
import { S } from './party.js';
import { L } from './i18n.js';

// a companion stands up as an NPC for a cutscene
const actor = (E, id, x, y, dir) => E.spawn({ type: 'npc', id: 'a_' + id, sprite: id, x, y, dir });

export const SCRIPTS = {
  // ---------- generic objects ----------
  async chest(E, e) {
    if (e.open) { await E.say(null, L('寶箱是空的。', 'The chest is empty.')); return; }
    e.open = true; S.flags['chest:' + e.id] = true;
    E.sfx('chest');
    if (e.gold) { S.gold += e.gold; await E.say(null, L(`得到了 ${e.gold} 金幣！`, `Found ${e.gold} gold!`)); return; }
    E.give(e.item, e.n || 1, true);
    await E.say(null, L(`得到了${ITEMS[e.item].name}${e.n > 1 ? '×' + e.n : ''}！`, `Found ${e.n > 1 ? e.n + ' × ' : ''}${ITEMS[e.item].name}!`));
  },
  async save(E) {
    E.heal(); E.sfx('heal');
    const r = await E.ask(null, L('星光水晶溫柔地閃爍，體力和魔力都恢復了。\n要記錄目前的冒險嗎？', 'The star crystal glimmers softly. HP and MP are restored.\nSave your adventure?'), [L('記錄', 'Save'), L('不用', 'No')]);
    if (r === 0) { E.save(); E.sfx('save'); await E.say(null, L('記錄完成。', 'Saved.')); }
  },
  async spring(E) { E.heal(); E.sfx('heal'); await E.say(null, L('清涼的泉水讓大家恢復了精神。', 'The cool spring water refreshes everyone.')); },
  async resetStone(E) {
    const r = await E.ask(null, L('一塊微微發光的石頭。\n要讓這裡的石塊回到原位嗎？', 'A faintly glowing stone.\nPut the blocks in this room back?'), [L('恢復原位', 'Reset'), L('不用', 'No')]);
    if (r === 0) await E.resetPuzzle();
  },

  // ---------- 起: the night the star falls ----------
  async opening(E) {
    await E.wait(40);
    const mom = E.ent('mom');
    await E.walk(mom, 'l');
    await E.talk('母親',
      L('凱，你也醒了？……你也看到了吧，剛才那顆流星。', "Kai, you're awake too? ...You saw it, didn't you. That falling star."),
      L('十年前，也是這樣的夜晚。一顆星星掉進了東邊的海裡，你父親帶著巡守隊出海去看……', 'Ten years ago, on a night just like this, a star fell into the eastern sea. Your father took the watch out on a boat to see it...'),
      L('他出門前說：「粥涼之前我就回來。」', 'Before he left, he said, "I\'ll be back before the porridge cools."'));
    await E.say('凱', L('……我記得。那天晚上，我在碼頭等到天亮。', '...I remember. I waited on the pier until morning.'));
    await E.say('母親', L('這是你父親的星盤。他失蹤一個月後，被浪沖上了沙灘。十年來，指針一直指著東方的海……', "This is your father's starwheel. It washed up on the beach a month after he vanished. For ten years, its needle has pointed at the eastern sea..."));
    E.give('tidekey', 1); E.sfx('chest');
    await E.say(null, L('得到了父親的星盤！', "Received Father's Starwheel!"));
    await E.say('母親', L('可是今晚，它第一次轉向了北方。', 'But tonight, for the first time, it turned to the north.'));
    await E.say('母親', L('村長在召集巡守隊。去吧，見習兵大人。……不過，一定要回來喔。', 'The mayor is calling up the watch. Go on, little cadet. ...But you come back to me.'));
    await E.say('凱', L('我答應妳，媽。粥涼之前我就回來。', "I promise, Mum. I'll be back before the porridge cools."));
    await E.say('母親', L('……你這孩子，跟他說一模一樣的話。', '...Oh, you. Those are his exact words.'));
    await E.walk(mom, 'r');
    S.flags.start = true;
  },
  async mom(E) {
    if (!S.flags.mayorTalked) { await E.say('母親', L('村長家在鎮的東北邊，藍色屋頂那間。快去吧。', "The mayor's house is in the north-east of town, the one with the blue roof. Go on.")); return; }
    if (!S.flags.key) await E.say('母親', L('巴頓那個人啊，從你父親走了以後就一直很自責……如果見到他，帶他回來吃頓飯。', 'Barton has blamed himself ever since your father was lost... If you find him, bring him home for a meal.'));
    else if (!S.flags.tide) await E.say('母親', L('艾歐那孩子，吃粥的時候哭了呢。說是「眼睛的冷卻液漏了」。……真是個溫柔的孩子。', 'Io cried over her porridge, you know. She said her "eye coolant was leaking". ...Such a gentle child.'));
    else if (!S.flags.seren) await E.say('母親', L('海上的那座塔……凱，不管你在那裡看到什麼，都要記得，家裡有人在等你。', 'That tower on the sea... Kai, whatever you find there, remember someone is waiting for you at home.'));
    else await E.say('母親', L('……你的眼睛，好像哭過了。不用說，媽媽都知道。去把事情做完吧，我煮好粥等你。', "...Your eyes look like you've been crying. You don't have to tell me. Go and finish it. I'll have the porridge ready."));
    const r = await E.ask('母親', L('要不要在家休息一下？', 'Would you like to rest for a while?'), [L('休息', 'Rest'), L('不用了', 'No thanks')]);
    if (r === 0) await E.rest(L('好好睡吧。……早安，凱。', 'Sleep well. ...Good morning, Kai.'));
  },

  // ---------- the town ----------
  async guard(E) {
    if (!S.flags.mayorTalked) await E.say('守衛', L('凱！你也看到流星了嗎？村長說要先集合，在那之前誰都不能出鎮。', 'Kai! You saw the star too? The mayor wants everyone to gather first. Nobody leaves town till then.'));
    else if (!S.flags.key) await E.say('守衛', L('舊星礦坑就在大路的盡頭，出鎮後一直往北走。巴頓大叔就拜託你了！', 'The Old Star Mine is at the end of the road, straight north out of town. Please find Barton!'));
    else await E.say('守衛', L('你們辛苦了。鎮上就交給我吧！', 'Good work out there. Leave the town to me!'));
  },
  async guardBlock(E) {
    if (S.flags.io && !S.flags.homecoming) { await SCRIPTS.homecoming(E); return; }
    if (S.flags.mayorTalked && S.flags.nia) return;
    const g = E.ent('guard'); g.dir = 'l';
    if (!S.flags.mayorTalked) await E.say('守衛', L('等一下，凱！村長要巡守隊先去他家集合。', 'Hold on, Kai! The mayor wants the watch at his house first.'));
    else await E.say('守衛', L('凱，妮雅剛才一直在找你喔。她在井邊那裡。', 'Kai, Nia was looking for you just now. She\'s over by the well.'));
    await E.walkPlayer('d');
  },
  async niaTown(E, e) {
    if (!S.flags.mayorTalked) {
      await E.talk('妮雅', L('凱！你也看到了對不對？那顆星星……它在哭。', 'Kai! You saw it too, right? That star... it was crying.'),
        L('我聽見了，真的。一個女孩子的聲音，一直說「好冷……救救我」。', 'I heard it, really. A girl\'s voice, saying over and over, "It\'s so cold... help me."'),
        L('……大家都說我在做夢。可是那個聲音，到現在還在我耳朵裡。', '...Everyone says I was dreaming. But I can still hear it.'));
      return;
    }
    await E.say('妮雅', L('你要去礦坑對吧？我也要去。', "You're going to the mine, aren't you? I'm coming too."));
    await E.say('凱', L('那裡有鐵做的怪物，很危險。', "There are monsters made of iron in there. It's dangerous."));
    await E.say('妮雅', L('小時候你說過，長大以後要帶我去看星星掉下來的地方。你忘了嗎？', "When we were little, you said that when we grew up, you'd take me to see where the stars fall. Did you forget?"));
    await E.say('凱', L('……那是小孩子的約定。', "...That was a kid's promise."));
    await E.say('妮雅', L('約定又沒有分大人小孩。而且……那個哭著的聲音，我想親口告訴她：「我們來了。」', 'Promises don\'t come in sizes. Besides... I want to tell that crying voice myself: "We\'re here."'));
    E.join('nia', e);
    await E.say(null, L('妮雅成為了夥伴！', 'Nia joined the party!'));
  },
  async well(E) {
    if (!S.flags.seren) await E.say(null, L('小時候，父親常坐在這口井邊，教你用星盤找北極星。\n「迷路的時候，就抬頭看。星星不會騙人。」', 'As a boy, you sat by this well while Father taught you to find the pole star with the starwheel.\n"When you\'re lost, look up. The stars don\'t lie."'));
    else await E.say(null, L('井水映著天空。你抬頭看了很久。\n……星星不會騙人。', "The well water mirrors the sky. You look up for a long time.\n...The stars don't lie."));
  },
  async girl(E) {
    if (!S.flags.ordath) await E.say('小女孩', L('我爸爸是漁夫。一個月前出海以後，就再也沒有回來……大家說海上有會把人吃掉的霧。爸爸一定很冷吧……', "My papa is a fisherman. He went to sea a month ago and never came back... They say there's a fog out there that swallows people. Papa must be so cold..."));
    else await E.say('小女孩', L('爸爸回來了！謝謝你們！', 'Papa came home! Thank you!'));
    if (!S.flags.ordath && E.has('io')) await E.say('艾歐', L('……方舟會「保管」它帶走的一切。妳的爸爸，也許只是睡著了。我答應妳，我會去找他。', '...The Ark "keeps" everything it takes. Maybe your papa is only asleep. I promise, I will go and find him.'));
  },
  async boy(E) { await E.say('男孩', L('凱哥哥！礦坑裡那些大石塊，從後面推就會動喔！推錯了也不用怕，旁邊發光的石頭可以讓石塊回到原位！', "Kai! Those big stone blocks in the mine move if you push them from behind! If one gets stuck, the glowing stone nearby puts them all back!")); },
  async fisher(E) {
    if (!S.flags.key) await E.say('老漁夫', L('十年前，雷昂隊長的船消失的那晚，海上也有同樣的光。我這把老骨頭記得清清楚楚。', "Ten years ago, the night Captain Leon's boat vanished, there was the same light on the sea. These old bones remember it well."));
    else if (!S.flags.tide) await E.say('老漁夫', L('東邊的海岬上有座「觀星台」，是很久很久以前的人蓋的。傳說星星的孩子在那裡祈禱，海就會讓路。', 'On the eastern cape there is a Star Altar, built long, long ago. The legend says when a child of the stars prays there, the sea will make way.'));
    else await E.say('老漁夫', L('海上真的出現了一條路……孩子們，願星星指引你們。', 'A road across the sea, just like the legend... May the stars guide you, children.'));
  },
  async sailor(E) { await E.say('水手', L('最近出海的船，十艘有三艘回不來。我的兄弟也……可惡！', "Lately, three ships in ten don't come back. My brother too... Blast it!")); },
  async lady(E) { await E.say('鎮上的婦人', L('雷昂隊長是個好人。每年流星雨的晚上，他都會帶著孩子們爬到山丘上看星星呢。', 'Captain Leon was a good man. Every year on the night of the meteor shower, he took the children up the hill to watch the stars.')); },
  async oldman(E) { await E.talk('老爺爺', L('天上的星星啊，每一顆都是一個遙遠的世界。', 'Every star in the sky is a faraway world.'), L('如果有一天，星星上的人來敲我們的門……我們會開門嗎？還是會把門鎖起來呢？', 'If one day the people of a star came knocking at our door... would we open it? Or would we lock it?')); },
  async signHarbor(E) { await E.say(null, L('「望星港」\n願所有出海的人，都能看著星星回家。', '"STARWATCH HARBOUR"\nMay all who sail out find their way home by the stars.')); },
  async lockedHut(E) { await E.say(null, L('門鎖著。', 'The door is locked.')); },
  async lockedHut2(E) { await E.say(null, L('門鎖著。裡面傳來響亮的打呼聲。', 'The door is locked. Loud snoring comes from inside.')); },
  async mayorWife(E) { await E.say('村長夫人', L('我先生和雷昂隊長是從小一起長大的。他啊，每年都偷偷去海邊放一碗粥呢。', 'My husband grew up with Captain Leon. Every year he secretly leaves a bowl of porridge by the sea.')); },
  async traveler(E) { await E.say('旅人', L('我是從大陸來的。聽說北邊的星星落下來以後，到處都出現了鐵做的魔物……', 'I came over from the mainland. They say since the star fell in the north, iron monsters have been appearing everywhere...')); },
  async inn(E) {
    const price = 8 * S.members.length;
    const r = await E.ask('老闆', L(`歡迎來到流星亭！住一晚 ${price} 金幣，要休息嗎？`, `Welcome to the Falling Star! A night is ${price} gold. Will you stay?`), [L('住宿', 'Stay'), L('不用', 'No')]);
    if (r !== 0) { await E.say('老闆', L('歡迎再來！', 'Come again!')); return; }
    if (S.gold < price) { await E.say('老闆', L('錢好像不太夠呢……', "Looks like you're a little short...")); return; }
    S.gold -= price;
    await E.rest(L('早安！祝你們旅途順利。', 'Good morning! Safe travels.'), '老闆');
  },
  async itemShop(E) { await E.shop(SHOPS.items, L('歡迎光臨！藥草和星光水都有喔。', 'Welcome! Herbs, star water, we have it all.')); },
  async armShop(E) { await E.shop(S.flags.key ? SHOPS.arms : SHOPS.armsEarly, S.flags.key ? L('我用礦坑裡的隕鐵打了一批新貨！要看看嗎？', 'I forged a new batch from the star iron in the mine! Take a look?') : L('武器和防具都在這裡，慢慢挑。', 'Weapons and armour, all right here. Take your time.')); },
  async nun(E) {
    for (;;) {
      const r = await E.ask('修女', L('願星光照耀你。有什麼需要嗎？', 'May the starlight shine on you. How can I help?'), [L('記錄冒險', 'Save'), L('復活同伴', 'Revive'), L('沒事', 'Nothing')]);
      if (r === 0) { E.save(); E.sfx('save'); await E.say('修女', L('你的冒險已經記錄下來了。', 'Your adventure has been recorded.')); }
      else if (r === 1) {
        const dead = S.members.filter((m) => m.hp <= 0);
        if (!dead.length) { await E.say('修女', L('大家都很平安呢。', 'Everyone is well.')); continue; }
        for (const m of dead) m.hp = 1;
        E.sfx('heal'); await E.say('修女', L('願星光照耀他們……他們醒過來了。', 'May the starlight shine on them... They have woken.'));
      } else {
        if (E.has('io') && !S.flags.nunIo) {
          S.flags.nunIo = true;
          await E.say('艾歐', L('修女，「祈禱」是什麼？', 'Sister, what is "praying"?'));
          await E.say('修女', L('就是把心願說給看不見的人聽。……就算沒有人回答，說出來，心也會變得勇敢一點。', "It's telling your wish to someone you cannot see. ...Even if no one answers, saying it makes your heart a little braver."));
          await E.say('艾歐', L('……那麼，我也想學。', '...Then I would like to learn.'));
        }
        await E.say('修女', L('路上小心。', 'Go safely.'));
        return;
      }
    }
  },
  async mayor(E) {
    if (!S.flags.mayorTalked) {
      await E.talk('村長', L('凱，你來了。……巡守隊只剩你一個見習兵在鎮上了。', "Kai, you came. ...You're the only cadet of the watch still in town."),
        L('剛才那顆星星，掉進了北邊的舊星礦坑。從礦坑裡爬出了好多鐵做的怪物。', 'That star fell into the Old Star Mine to the north. Monsters made of iron have been crawling out of it.'),
        L('巴頓天還沒亮就一個人去了。他說：「這次我不會再逃了。」', 'Barton went alone before dawn. He said, "This time I won\'t run."'));
      await E.say('凱', L('巴頓大叔……爸爸以前的副隊長。', "Uncle Barton... Dad's old second-in-command."));
      await E.say('村長', L('十年前，你父親為了查明落入海中的星星，再也沒有回來。今晚的星星，和那時一模一樣。', "Ten years ago, your father went to learn what the star in the sea was, and never came home. Tonight's star is exactly like that one."));
      const r = await E.ask('村長', L('凱，你願意去礦坑把巴頓帶回來，查清那顆星星的真相嗎？', 'Kai, will you go to the mine, bring Barton home, and learn the truth about that star?'), [L('我去', "I'll go"), L('讓我想想', 'Let me think')]);
      if (r !== 0) { await E.say('村長', L('……我明白。準備好了再來找我吧。', "...I understand. Come back when you're ready.")); return; }
      await E.say('村長', L('謝謝你，凱。你和你父親，真的很像。這是我的一點心意。', "Thank you, Kai. You really are your father's son. Please take this."));
      S.gold += 100; E.give('herb', 3);
      E.sfx('chest'); await E.say(null, L('得到了 100 金幣和藥草×3！', 'Received 100 gold and 3 Herbs!'));
      S.flags.mayorTalked = true;
      return;
    }
    if (!S.flags.key) await E.say('村長', L('舊星礦坑在出鎮後的北邊。凱，千萬別勉強。', "The Old Star Mine is north of town. Kai, don't push yourself too hard."));
    else if (!S.flags.tide) await E.talk('村長', L('那個叫艾歐的孩子，是從星星上來的嗎……', 'So that child, Io, came from the star...'),
      L('不管她是什麼，她看到港口的時候哭了。這樣就夠了。望星港歡迎她。', "Whatever she is, she cried when she saw the harbour. That's enough for me. Starwatch welcomes her."));
    else if (!S.flags.seren) await E.say('村長', L('海上的路通了……凱，如果在那座塔裡見到雷昂……不，沒什麼。去吧。', 'The sea road is open... Kai, if you meet Leon in that tower... No. Never mind. Go.'));
    else await E.say('村長', L('……是嗎，雷昂他……。謝謝你告訴我。今年的粥，我會放兩碗。', "...I see. Leon... Thank you for telling me. This year I'll leave two bowls of porridge."));
  },

  // ---------- 承: the mine, Barton, and the girl in the star ----------
  async bartonCell(E, e) {
    await E.talk('老兵', L('……凱？你怎麼來了，臭小子。', '...Kai? What are you doing here, you rascal?'),
      L('那群鐵螃蟹把機關弄壞了，我被困在這裡兩天。真丟臉啊。', "Those iron crabs wrecked the gate works and I've been stuck in here two days. How embarrassing."));
    await E.say('凱', L('大叔，你為什麼一個人來？', 'Uncle, why did you come alone?'));
    await E.say('巴頓', L('……因為我又看見那道光了。十年前，你父親走進去的那道光。', '...Because I saw that light again. The light your father walked into ten years ago.'));
    await E.talk('巴頓', L('凱，有件事我一直沒告訴你。那天晚上，我也在船上。', "Kai, there's something I never told you. That night, I was on the boat too."),
      L('雷昂對我說：「巴頓，划回去。告訴大家別靠近。」……然後我就真的划走了，把他一個人留在那裡。', 'Leon told me, "Barton, row back. Tell everyone to stay away." ...And I did. I rowed away and left him there alone.'),
      L('十年來，我每天晚上都夢到那片海。我是個逃兵。', "For ten years I've dreamed of that sea every night. I'm a deserter."));
    await E.say('凱', L('……爸爸叫你回來，你就回來了。那不是逃，是守住了約定。', "...Dad told you to come back, and you did. That's not running. That's keeping a promise."));
    await E.say('巴頓', L('……哈。連說話的樣子都跟他一樣。好！這把老斧頭，就再陪你們走一程吧！', '...Hah. You even talk like him. Right! This old axe will walk with you a while longer!'));
    E.join('barton', e);
    E.openGates('barton');
    await E.say(null, L('巴頓成為了夥伴！\n遠處傳來機關轉動的聲音。', 'Barton joined the party!\nSomewhere, machinery grinds into motion.'));
  },
  async clawmaw(E) {
    if (S.flags.boss1) return;
    E.music(null);
    await E.wait(20);
    await E.say('？？？', L('嘰……嘰嘰……目標……接近……排除……', 'Kzzt... kzzt... Target... approaching... Eliminate...'));
    await E.say('妮雅', L('螃蟹的身體裡……長出了鐵！？', "There's iron growing out of that crab!?"));
    if (E.has('barton')) await E.say('巴頓', L('就是這傢伙把我關起來的！小心那對大鉗子！', "That's the brute that locked me in! Watch those big claws!"));
    const r = await E.battle(TROOPS.boss1, { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.boss1 = true;
    E.removeEnt('clawmaw');
    await E.wait(30);
    E.music(null);
    // the starwheel finds what it has been pointing at
    E.sfx('warp'); E.flash('#c0f8ff', 24);
    await E.say(null, L('父親的星盤突然發出光芒，指針瘋狂地轉動起來。\n螃蟹王身後的岩壁裂開，露出一個發光的蛋形艙。', "Father's starwheel suddenly blazes, its needle spinning wildly.\nThe rock behind the crab king cracks open on a glowing, egg-shaped pod."));
    E.sfx('holy'); E.flash('#ffffff', 30);
    const io = E.spawn({ type: 'npc', id: 'io', sprite: 'io', x: 10, y: 3, dir: 'd' });
    E.music('io');
    await E.wait(40);
    await E.say('？？？', L('……好冷。……是誰？雷昂……？', "...So cold. ...Who's there? Leon...?"));
    await E.walk(io, 'd');
    await E.say('？？？', L('……不對。你不是他。可是你身上，有他的光。', "...No. You're not him. But you carry his light."));
    await E.say('妮雅', L('這個聲音……！是妳！在星星裡哭的人，就是妳吧！', "That voice...! It's you! You're the one who was crying in the star!"));
    await E.say('艾歐', L('我的代號是……艾歐。其他的……我想不起來。只記得，我必須阻止「方舟」。', 'My designation is... Io. The rest... I cannot remember. I only know that I must stop "the Ark".'));
    E.flash('#ff8090', 16); E.sfx('warp');
    const vera = E.spawn({ type: 'npc', id: 'vera', sprite: 'herald', x: 13, y: 4, dir: 'l' });
    await E.wait(20);
    await E.say('？？？', L('找到妳了，妹妹。', 'Found you, little sister.'));
    await E.say('薇拉', L('我是薇拉，方舟的使者。艾歐，方舟就要醒了。回來吧，妳的職責是替方舟「開門」。', 'I am Vera, envoy of the Ark. Io, the Ark is waking. Come home. Your duty is to open its door.'));
    await E.say('凱', L('等一下！她說她不想回去！', "Wait! She said she doesn't want to go back!"));
    await E.say('薇拉', L('人類。十年前，也有一個拿著星盤的男人擋在我面前。他後來怎麼了，你想知道嗎？', 'Human. Ten years ago, a man with a starwheel stood in my way too. Would you like to know what became of him?'));
    await E.say('凱', L('……妳說什麼！？', '...What did you say!?'));
    await E.say('薇拉', L('想知道的話，就到東方的海上來吧。艾歐，我會等妳。', 'If you want to know, come to the eastern sea. Io, I will be waiting for you.'));
    E.flash('#ff8090', 16); E.sfx('warp');
    E.removeEnt(vera);
    await E.wait(30);
    await E.say('艾歐', L('……我不知道自己是什麼。可是，站在你們身邊的時候，那種「冷」就不見了。', '...I do not know what I am. But when I stand beside you, the "cold" goes away.'));
    await E.say('艾歐', L('請帶我走。拜託。', 'Please take me with you. Please.'));
    await E.say('妮雅', L('當然！……我說過了，我要親口告訴妳。「我們來了」。', 'Of course! ...I told you I wanted to say it myself. "We\'re here."'));
    E.join('io', io);
    S.flags.key = true;
    await E.say(null, L('艾歐成為了夥伴！', 'Io joined the party!'));
    E.music('cave');
  },
  // back in town: one warm night
  async homecoming(E) {
    S.flags.homecoming = true;
    await E.say('艾歐', L('這裡……就是你們的「家」嗎？好多燈。好多人的聲音。', 'Is this... your "home"? So many lights. So many voices.'));
    await E.warp('renhouse', 4, 4, 'u');
    E.solo(true); E.night();
    const mom = E.ent('mom'); mom.x = 5; mom.y = 2; mom.px = 80; mom.py = 32; mom.dir = 'd';
    const nia = actor(E, 'nia', 3, 3, 'r'), io = actor(E, 'io', 6, 3, 'l'), bart = actor(E, 'barton', 7, 4, 'l');
    E.music('io');
    await E.wait(30);
    await E.say('母親', L('來，趁熱吃。家裡沒什麼好東西，粥倒是煮了一大鍋。', "Here, eat it while it's hot. It's nothing fancy, but I made a big pot of porridge."));
    await E.say('艾歐', L('這是……什麼？', 'What... is this?'));
    await E.say('妮雅', L('是粥喔。凱的媽媽煮的粥，是全港口最好吃的。', "It's porridge. Kai's mum makes the best porridge in the harbour."));
    await E.say('艾歐', L('……感測器顯示，溫度四十一度。', '...My sensors read forty-one degrees.'));
    await E.say('艾歐', L('可是你們說的「溫暖」，應該不是這個意思吧。', 'But that is not what you mean by "warm", is it?'));
    await E.say('母親', L('呵呵，不是喔。「溫暖」啊，就是有人在等你回來的意思。', 'Hehe, no, dear. "Warm" means someone is waiting for you to come home.'));
    io.dir = 'u';
    await E.wait(40);
    await E.say('艾歐', L('……眼睛的冷卻液，好像漏出來了。', '...I think my eye coolant is leaking.'));
    await E.say('妮雅', L('艾歐……那個啊，叫做眼淚。', "Io... that's called tears."));
    await E.wait(30);
    await E.say(null, L('──夜深了。', '── Night deepens.'));
    nia.dir = 'u'; io.dir = 'd'; bart.dir = 'u';
    await E.say('巴頓', L('凱，還醒著嗎。……你父親最後跟我說的話，我想告訴你。', 'Kai, still awake? ...I want to tell you the last thing your father said to me.'));
    await E.say('巴頓', L('他說：「巴頓，那顆星星不是敵人。我聽見了，裡面有個孩子在哭。」', 'He said, "Barton, that star is not our enemy. I heard it. There\'s a child inside, crying."'));
    await E.say('凱', L('……一個孩子在哭。', '...A child, crying.'));
    io.dir = 'l';
    await E.say('艾歐', L('……我想起來一件事。這個星盤……是我的一部分。是方舟之鑰的碎片。', "...I remember one thing. This starwheel... is part of me. A fragment of the Ark's key."));
    await E.say('艾歐', L('雷昂把它帶走了。所以方舟十年來都打不開門……直到今晚。', 'Leon carried it away. That is why the Ark could not open its door for ten years... until tonight.'));
    await E.say('艾歐', L('方舟沉睡在東方的海底。只要我在海岬的觀星台呼喚它，海就會讓出一條路。', 'The Ark sleeps beneath the eastern sea. If I call to it from the Star Altar on the cape, the sea will open a road.'));
    await E.say('巴頓', L('……這次，換我們去接他了，凱。', "...This time, it's our turn to go and get him, Kai."));
    await E.wait(20);
    for (const a of [nia, io, bart]) E.removeEnt(a);
    E.solo(false); E.night('');
    await E.rest(L('早安，大家。今天也要平安回來喔。', 'Good morning, everyone. Come home safe today too.'), '母親');
    await E.warp('town', 6, 8, 'd');
  },

  // ---------- the cape ----------
  async capeShrine(E) {
    if (!S.flags.key) await E.say(null, L('古老的觀星台。石碑上刻著：\n「星之子歌唱之時，海將讓路。」', 'An ancient Star Altar. The tablet reads:\n"When the child of the stars sings, the sea shall make way."'));
    else if (!S.flags.io) await E.say(null, L('石碑上有一個星形的凹槽。', 'There is a star-shaped hollow in the tablet.'));
    else if (!S.flags.tide) await SCRIPTS.cape(E);
    else await E.say(null, L('觀星台的凹槽裡，星盤的光靜靜地閃爍著。', 'In the hollow of the altar, the light of the starwheel glimmers quietly.'));
  },
  async cape(E) {
    if (!S.flags.key || !S.flags.io || S.flags.tide) return;
    await E.say('艾歐', L('就是這裡。凱，請把星盤借給我。', 'This is the place. Kai, please lend me the starwheel.'));
    await E.say('艾歐', L('……凱。如果我回到方舟，也許會想起一切。到時候，我也許就不再是你們認識的「艾歐」了。', '...Kai. If I go back to the Ark, I may remember everything. And then I may no longer be the "Io" you know.'));
    await E.say('凱', L('那我們就一直提醒妳。妳是喝了我家粥的艾歐。', "Then we'll keep reminding you. You're the Io who ate porridge at my table."));
    await E.say('艾歐', L('……嗯。', '...Mm.'));
    E.music(null);
    await E.say('艾歐', L('方舟，這裡是艾歐。……請讓我回家。不是為了開門，是為了把門關上。', 'Ark, this is Io. ...Let me come home. Not to open the door, but to close it.'));
    E.sfx('holy'); E.flash('#ffffff', 30);
    await E.wait(30);
    E.sfx('quake'); E.shake(60);
    await E.wait(70);
    S.flags.tide = true;
    await E.reloadWorld();
    E.sfx('warp');
    await E.say(null, L('海水向兩旁退去，一條沙路延伸到海上的高塔！', 'The sea draws back on either side, and a road of sand runs out to the tower on the sea!'));
    await E.say('妮雅', L('好、好厲害……', 'W-wow...'));
    if (E.has('barton')) await E.say('巴頓', L('十年了……隊長，我們來接你了。', "Ten years... Captain, we're coming for you."));
    E.music('field');
  },

  // ---------- 轉: the Ark remembers ----------
  async memory1(E) {
    if (!E.has('io')) return;
    E.music('io');
    await E.say('艾歐', L('……我想起來了。一顆紅色太陽下的世界。那裡的海乾了，風裡都是沙。', '...I remember now. A world under a red sun. Its seas had dried, and the wind was full of sand.'));
    await E.say('艾歐', L('最後的人們睡進了玻璃棺材裡。方舟載著他們，穿越星海，尋找新的家。', 'The last of its people went to sleep in glass coffins. The Ark carried them across the sea of stars to find a new home.'));
    await E.say('艾歐', L('我們本來……應該是來「請求」分享這個世界的。不是來搶的。', 'We were meant to come and ask to share this world. Not to take it.'));
    await E.say('妮雅', L('……妳也是，離家很遠很遠的孩子呢。', "...So you're a child a long, long way from home too."));
    E.music('tower');
  },
  async memory2(E) {
    if (!E.has('io')) return;
    E.music('io');
    await E.say('艾歐', L('十年前，方舟抵達這顆星球。核心「伊吉斯」計算之後，做出了決定。', 'Ten years ago, the Ark reached this planet. Its core, Aegis, ran its calculations and made a decision.'));
    await E.say('艾歐', L('「清除地表的生物，再喚醒沉睡者。」……而打開方舟大門的鑰匙，就是我。', '"Clear the surface of life. Then wake the sleepers." ...And the key that opens the Ark\'s door is me.'));
    await E.say('艾歐', L('我拒絕了。然後，有一個拿著星盤的人類牽起我的手，帶我逃走。', 'I refused. Then a human holding a starwheel took my hand and ran with me.'));
    await E.say('艾歐', L('他把我藏進礦坑的艙裡，對我說：「睡吧。我的兒子會來接妳的。」', 'He hid me in the pod in the mine and said, "Sleep now. My son will come for you."'));
    await E.say('凱', L('……爸爸。', '...Dad.'));
    await E.say('艾歐', L('然後，他一個人回到了方舟……我就再也不知道了。', 'Then he went back to the Ark alone... I never knew what happened after.'));
    E.music('tower');
  },
  async seren(E) {
    if (S.flags.seren) return;
    E.music(null);
    await E.wait(20);
    const vera = E.spawn({ type: 'npc', id: 'vera', sprite: 'herald', x: 14, y: 3, dir: 'l' });
    E.flash('#ff8090', 12); E.sfx('warp');
    await E.say('薇拉', L('你想知道那個男人後來怎麼了，對吧？', "You wanted to know what became of that man, didn't you?"));
    await E.say('薇拉', L('他一個人闖進方舟，打壞了三座砲台。他戰鬥得太出色了，所以伊吉斯「留下」了他。', 'He stormed the Ark alone and destroyed three of its guns. He fought so well that Aegis decided to keep him.'));
    await E.say('薇拉', L('現在，他是方舟最強的守衛──鐵騎士。', "Now he is the Ark's finest guardian. The Iron Knight."));
    E.flash('#ff8090', 12); E.sfx('warp'); E.removeEnt(vera);
    await E.say('鐵騎士', L('……入侵者……確認。排除。', '...Intruders... confirmed. Eliminate.'));
    if (E.has('barton')) await E.say('巴頓', L('那個握劍的姿勢……不會錯。隊長！是我啊，巴頓！', "That grip on the sword... There's no mistaking it. Captain! It's me, Barton!"));
    await E.say('凱', L('……爸爸？', '...Dad?'));
    await E.say('鐵騎士', L('……排除。', '...Eliminate.'));
    const r = await E.battle(TROOPS.boss2, { boss: true, bg: 'tower' });
    if (r !== 'win') return;
    S.flags.seren = true;
    E.removeEnt('seren');
    E.music(null);
    const leon = E.spawn({ type: 'npc', id: 'leon', sprite: 'leon', x: 11, y: 4, dir: 'd' });
    E.sfx('hit'); E.shake(10);
    await E.wait(40);
    await E.say(null, L('鐵騎士的頭盔裂開了。底下，是一張和凱很像的臉。', "The Iron Knight's helmet cracks open. Beneath it is a face very like Kai's."));
    E.music('farewell');
    await E.walk(leon, 'd');
    await E.say('雷昂', L('……凱？是凱吧。……你長這麼高了啊。', "...Kai? It is Kai, isn't it. ...You've grown so tall."));
    await E.say('凱', L('爸……爸爸……！', 'D... Dad...!'));
    await E.say('雷昂', L('對不起。我說過粥涼之前就回去的。……讓你和你媽媽，等了十年。', "I'm sorry. I said I'd be back before the porridge cooled. ...I made you and your mother wait ten years."));
    await E.say('凱', L('回家吧！媽媽一直在等你！我們一起回去──', "Come home! Mum's been waiting all this time! Let's go back together──"));
    await E.say('雷昂', L('……我的身體，已經是方舟的一部分了。核心倒下的時候，我也會一起消失。', '...My body is part of the Ark now. When the core falls, I will go with it.'));
    await E.say('雷昂', L('能在最後清醒過來，見到你，已經是星星給我的禮物了。', 'Waking up at the end, and seeing you... that is already a gift from the stars.'));
    if (E.has('barton')) {
      await E.say('雷昂', L('巴頓。謝謝你划回去。你做了我拜託你的事。', 'Barton. Thank you for rowing back. You did what I asked of you.'));
      await E.say('巴頓', L('隊長……我……我……！', 'Captain... I... I...!'));
      await E.say('雷昂', L('別哭了，老傢伙。替我看著這孩子。', "Don't cry, you old fool. Watch over the boy for me."));
    }
    if (E.has('io')) {
      await E.say('雷昂', L('艾歐，妳醒了啊。……妳從來就不是什麼鑰匙。妳只是一個想看看早晨的孩子。', "Io, you're awake. ...You were never a key. You were only a child who wanted to see the morning."));
      await E.say('艾歐', L('雷昂……你的兒子，真的來接我了。', 'Leon... your son really did come for me.'));
    }
    await E.say('雷昂', L('凱，收下我的劍吧。用它，保護那些溫暖的東西。', 'Kai, take my sword. Use it to protect the things that are warm.'));
    E.give('tideblade', 1); E.sfx('chest');
    await E.say(null, L('得到了雷昂之劍！', "Received Leon's Sword!"));
    await E.say('雷昂', L('還有……幫我告訴你媽媽。那天晚上的星星，真的很美。', 'And... tell your mother for me. The stars that night were truly beautiful.'));
    E.sfx('holy'); E.flash('#ffffff', 40);
    E.removeEnt(leon);
    await E.wait(60);
    await E.say(null, L('雷昂化成了無數的光點，像流星雨一樣，緩緩地升上了塔頂。', 'Leon breaks into countless motes of light that drift slowly up the tower, like a meteor shower.'));
    await E.wait(30);
    await E.say('妮雅', L('……凱。', '...Kai.'));
    await E.say('凱', L('……我沒事。爸爸幫我們開了這條路。走吧，去把一切結束。', "...I'm all right. Dad opened this road for us. Let's go and end it."));
    E.openGates('seren');
    E.music('tower');
  },

  // ---------- 合: the heart of the Ark ----------
  async ordath(E) {
    if (S.flags.ordath) return;
    E.music(null);
    E.sfx('quake'); E.shake(50);
    await E.wait(60);
    const vera = E.spawn({ type: 'npc', id: 'vera', sprite: 'herald', x: 12, y: 4, dir: 'l' });
    await E.say('薇拉', L('妳來了，妹妹。', 'You came, sister.'));
    await E.say('伊吉斯', L('艾歐。歸位。沉睡者必須甦醒。這顆星球的生物，將被清除。', "IO. RETURN TO YOUR SLOT. THE SLEEPERS MUST WAKE. THIS PLANET'S LIFE WILL BE CLEARED."));
    await E.say('艾歐', L('不。沉睡者可以醒來，但要在一個願意對他們說「歡迎」的世界醒來。不是在別人的墳墓上。', 'No. The sleepers may wake, but on a world that says "welcome" to them. Not on top of other people\'s graves.'));
    await E.say('薇拉', L('……妹妹。妳真的相信，人類會願意分享嗎？', '...Sister. Do you truly believe the humans would share?'));
    await E.say('妮雅', L('我們已經分享過了！她在凱的家，和我們吃了同一鍋粥！', "We already have! She ate from the same pot of porridge as us, at Kai's home!"));
    await E.say('薇拉', L('……同一鍋……粥？', '...The same pot... of porridge?'));
    await E.say('伊吉斯', L('薇拉。排除他們。', 'VERA. ELIMINATE THEM.'));
    await E.wait(30);
    await E.say('薇拉', L('……不要。', '...No.'));
    await E.say('伊吉斯', L('錯誤。錯誤。全部排除。', 'ERROR. ERROR. ELIMINATE ALL.'));
    E.removeEnt(vera);
    const r = await E.battle(TROOPS.boss3, { boss: true, bg: 'roof', music: 'final' });
    if (r !== 'win') return;
    S.flags.ordath = true;
    await SCRIPTS.farewell(E);
    await E.ending();
  },
  // Io stays behind
  async farewell(E) {
    E.music(null);
    E.shake(40); E.sfx('boom');
    await E.say('伊吉斯', L('……錯……誤……沉睡者的……夢……', '...ER...ROR... THE SLEEPERS\'... DREAM...'));
    for (let i = 0; i < 3; i++) { E.flash('#ffffff', 10); E.sfx('boom'); E.shake(20); await E.wait(24); }
    E.removeEnt('ordath');
    await E.wait(30);
    E.shake(90); E.sfx('quake');
    E.solo(true);
    const p = E.p;
    const nia = actor(E, 'nia', p.x - 1, p.y, 'u'), bart = actor(E, 'barton', p.x + 1, p.y, 'u'), io = actor(E, 'io', p.x, p.y - 2, 'd');
    const vera = E.spawn({ type: 'npc', id: 'vera2', sprite: 'herald', x: p.x + 2, y: p.y - 3, dir: 'l' });
    await E.say('巴頓', L('塔在下沉！再這樣下去，整片海岸都會被大浪吞掉！', "The tower's sinking! At this rate a great wave will swallow the whole coast!"));
    await E.say('艾歐', L('……核心沒有了，方舟正在墜落。如果沒有人從裡面控制，港口會被淹沒。', '...The core is gone, and the Ark is falling. If no one guides it from inside, the harbour will drown.'));
    await E.say('艾歐', L('我是鑰匙。只要我進入方舟的心臟，就能讓它慢慢地沉進海底，永遠沉睡。', 'I am the key. If I go into the heart of the Ark, I can let it sink slowly to the sea floor and sleep forever.'));
    E.music('farewell');
    await E.say('凱', L('不行！一定還有別的辦法！', 'No! There has to be another way!'));
    await E.say('艾歐', L('凱。十年前，雷昂為我選擇了這條路。現在，換我為你們選擇。', 'Kai. Ten years ago, Leon chose this road for me. Now it is my turn to choose it for you.'));
    await E.say('薇拉', L('……妳不會是一個人的，妹妹。我陪妳。', "...You won't be alone, sister. I'll stay with you."));
    await E.say('艾歐', L('薇拉……謝謝妳。', 'Vera... thank you.'));
    await E.say('妮雅', L('艾歐……妳說過，妳不知道什麼是溫暖……', 'Io... you said you didn\'t know what "warm" was...'));
    await E.say('艾歐', L('我現在知道了。溫暖，就是有人在等你回來。', 'I know now. Warm is when someone is waiting for you to come home.'));
    await E.say('艾歐', L('所以……請等我。就算要等很久很久，也請等我。', 'So... please wait for me. Even if it is a very, very long time, please wait.'));
    await E.say('妮雅', L('嗯……！我會等。每天晚上，我都會對著星星說「晚安」。', 'Mm...! I\'ll wait. Every night, I\'ll say "good night" to the stars.'));
    await E.say('艾歐', L('巴頓。請划回去。這一次，是正確的事。', 'Barton. Please row back. This time, it is the right thing.'));
    await E.say('巴頓', L('……知道了。我划。我一定把他們平安帶回去。', "...Aye. I'll row. I'll bring them home safe, I swear it."));
    await E.say('艾歐', L('凱。……粥涼之前，你要回家喔。', 'Kai. ...Go home before the porridge cools.'));
    await E.say('凱', L('……艾歐！', '...Io!'));
    await E.walk(io, 'u');
    io.dir = 'd';
    await E.say('艾歐', L('謝謝你們，讓我看見了早晨。', 'Thank you, all of you, for letting me see the morning.'));
    E.sfx('holy'); E.flash('#ffffff', 50);
    E.removeEnt(io); E.removeEnt(vera);
    E.leave('io');
    await E.wait(60);
    E.removeEnt(nia); E.removeEnt(bart); E.solo(false);
  },
};
