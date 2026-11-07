'use strict';
// Player-facing translations for high-install markets. Keep each array aligned with its keys.
// Native speakers should review market-specific nuance before a paid acquisition launch.
(() => {
  const fields = {
    core: ['homeAria','soundOn','soundOff','levelLabel','instruction','branch','branches','empty','moves','undo','hint','restart','extra','tagline','continue'],
    feedback: ['pickDestination','invalidMove','collectFour','allHome','victoryLine','victorySummary','next','playAgain','undoDone','restartTitle','restartBody','restartConfirm','extraAdded','searching','hintMove','hintFallback'],
    menu: ['forestAdventures','levels','changeDifficulty','modeTitle','modeBody','starsHelp','animation','on','off','language','difficultyAria','voice','voiceOn'],
  };
  const add = (code, name, voiceTag, data) => {
    const copy = {...window.FluffyLocales.en};
    for (const [group, keys] of Object.entries(fields)) {
      if (!Array.isArray(data[group]) || data[group].length !== keys.length) throw Error(`Locale ${code} has invalid ${group} count`);
      for (let i=0;i<keys.length;i++) copy[keys[i]]=data[group][i];
    }
    for (const [key,count] of [['names',6],['chapters',3],['modes',3],['modeDetails',3]]) {
      if (!Array.isArray(data[key]) || data[key].length!==count) throw Error(`Locale ${code} needs ${count} ${key}`);
    }
    copy.names=data.names;
    copy.chapters=data.chapters;
    copy.modes=Object.fromEntries(['cozy','adventure','expert'].map((key,i)=>[key,data.modes[i]]));
    copy.modeDetails=Object.fromEntries(['cozy','adventure','expert'].map((key,i)=>[key,data.modeDetails[i]]));
    window.FluffyLocales[code]=copy;
    window.FluffyLocaleNames[code]=name;
    window.FluffyVoiceTags[code]=voiceTag;
  };

  add('hi','हिन्दी','hi-IN',{
    names:['लोमड़ी का बच्चा','खरगोश','रेकून','भालू का बच्चा','बिल्ली का बच्चा','पांडा'],
    chapters:['चाँदनी वन','जुगनुओं की घाटी','रहस्यमय जंगल'],
    modes:['आरामदायक','रोमांच','विशेषज्ञ'],
    modeDetails:['3 जानवर · 3 खाली डालियाँ · आराम से खेलें','5 जानवर · 2 खाली डालियाँ · कठिन पहेलियाँ','6 जानवर · 1 खाली डाली · छिपे जानवर'],
    core:[
      'लेवल चुनें','आवाज़ चालू करें','आवाज़ बंद करें','लेवल','एक जैसे जानवरों को एक ही डाली पर मिलाएँ',
      'डाली','जानवरों की डालियाँ','खाली','चालें','वापस','संकेत','फिर से','डाली','छोटे कदम, ढेर सारा प्यार।','खेल जारी रखें',
    ],
    feedback:[
      'अब खाली डाली या उसी जानवर को चुनें','सिर्फ खाली डाली या उसी तरह के जानवर के पास जाएँ','हर डाली पर चार एक जैसे जानवर इकट्ठा करें',
      'सब घर पहुँच गए!','सारे परिवार फिर साथ हैं।','लेवल {level} को {moves} चालों में पूरा किया।','अगला रोमांच →','फिर खेलें',
      'चाल वापस ली','फिर से शुरू करें?','इस लेवल की आपकी चालें रीसेट हो जाएँगी।','लेवल फिर से शुरू करें',
      'एक अतिरिक्त डाली से पहेली सुलझाना आसान होगा','घर का रास्ता खोज रहे हैं…','डाली {a} से डाली {b} पर जानवर ले जाएँ','पिछली चाल वापस लें या एक खाली डाली जोड़ें',
    ],
    menu:[
      'जंगल का रोमांच','लेवल','कठिनाई बदलें','अपनी रफ्तार चुनें','हर मोड की प्रगति अलग से सेव होती है।',
      'कम चालों में हल करें और 3 स्टार पाएँ। सीमा पार होने पर भी लेवल पूरा कर सकते हैं।','एनिमेशन','चालू','बंद','भाषा','कठिनाई मोड','बोलकर सहायता','बोलकर सहायता चालू है',
    ],
  });

  add('id','Bahasa Indonesia','id-ID',{
    names:['Anak rubah','Kelinci','Rakuna','Anak beruang','Anak kucing','Panda'],
    chapters:['Hutan Cahaya Bulan','Lembah Kunang-kunang','Hutan Rahasia'],
    modes:['Santai','Petualangan','Ahli'],
    modeDetails:['3 jenis hewan · 3 dahan cadangan · main santai','5 jenis hewan · 2 dahan cadangan · teka-teki lebih seru','6 jenis hewan · 1 dahan cadangan · hewan tersembunyi'],
    core:[
      'Pilih level','Nyalakan suara','Matikan suara','LEVEL','Satukan hewan sejenis di satu dahan',
      'Dahan','Dahan untuk hewan','kosong','langkah','Urungkan','Petunjuk','Ulangi','Dahan','Langkah kecil, pelukan besar.','Lanjut bermain',
    ],
    feedback:[
      'Sekarang pilih dahan kosong atau hewan sejenis','Hanya bisa pindah ke dahan kosong atau hewan sejenis','Kumpulkan empat hewan sejenis di setiap dahan',
      'Semuanya pulang!','Keluarga mereka berkumpul lagi.','Level {level} selesai dalam {moves} langkah.','Petualangan berikutnya →','Main lagi',
      'Langkah dibatalkan','Mulai dari awal?','Langkah di level ini akan diatur ulang.','Ulangi level',
      'Dahan tambahan memberi ruang untuk memecahkan teka-teki','Mencari jalan pulang…','Pindahkan hewan dari dahan {a} ke dahan {b}','Urungkan langkah terakhir atau tambahkan dahan kosong',
    ],
    menu:[
      'Petualangan Hutan','level','Ubah kesulitan','Pilih ritmemu','Progres tiap mode disimpan terpisah.',
      'Capai target langkah untuk 3 bintang. Kamu tetap bisa menyelesaikan level meski melebihi target.','Animasi','nyala','mati','Bahasa','Mode kesulitan','Panduan suara','Panduan suara aktif',
    ],
  });

  add('pt','Português (Brasil)','pt-BR',{
    names:['Raposa','Coelhinho','Guaxinim','Ursinho','Gatinho','Panda'],
    chapters:['Bosque ao Luar','Vale dos Vaga-lumes','Floresta Secreta'],
    modes:['Tranquilo','Aventura','Especialista'],
    modeDetails:['3 tipos de bichinhos · 3 galhos extras · relaxe e jogue','5 tipos · 2 galhos extras · desafios maiores','6 tipos · 1 galho extra · bichinhos escondidos'],
    core:[
      'Escolher fase','Ativar som','Desativar som','FASE','Junte bichinhos iguais no mesmo galho',
      'Galho','Galhos com bichinhos','vazio','movimentos','Desfazer','Dica','Reiniciar','Galho','Passinhos pequenos. Abraços enormes.','Continuar jogando',
    ],
    feedback:[
      'Agora escolha um galho vazio ou um bichinho igual','Só é possível pular para um galho vazio ou com bichinhos iguais','Reúna quatro bichinhos iguais em cada galho',
      'Todo mundo em casa!','As famílias estão juntinhas de novo.','Fase {level} concluída em {moves} movimentos.','Próxima aventura →','Jogar de novo',
      'Movimento desfeito','Começar de novo?','Seus movimentos nesta fase serão reiniciados.','Reiniciar fase',
      'Um galho extra ajuda a resolver o desafio','Procurando o caminho de casa…','Mova um bichinho do galho {a} para o galho {b}','Desfaça o último movimento ou adicione um galho vazio',
    ],
    menu:[
      'Aventuras na Floresta','fases','Alterar dificuldade','Jogue no seu ritmo','O progresso de cada modo é salvo separadamente.',
      'Alcance a meta de movimentos para ganhar 3 estrelas. Mesmo passando da meta, você pode terminar a fase.','Animação','ligada','desligada','Idioma','Modo de dificuldade','Narração','Narração ativada',
    ],
  });

  add('es','Español (Latinoamérica)','es-MX',{
    names:['Zorrito','Conejito','Mapache','Osito','Gatito','Panda'],
    chapters:['Bosque de Luna','Valle de las Luciérnagas','Bosque Secreto'],
    modes:['Relajado','Aventura','Experto'],
    modeDetails:['3 tipos de animales · 3 ramas extra · juega sin prisa','5 tipos · 2 ramas extra · más combinaciones','6 tipos · 1 rama extra · animales ocultos'],
    core:[
      'Elegir nivel','Activar sonido','Desactivar sonido','NIVEL','Reúne animales iguales en una misma rama',
      'Rama','Ramas con animales','vacía','movimientos','Deshacer','Pista','Reiniciar','Rama','Pasitos pequeños. Abrazos enormes.','Seguir jugando',
    ],
    feedback:[
      'Ahora elige una rama vacía o un animal igual','Solo puedes saltar a una rama vacía o con animales iguales','Reúne cuatro animales iguales en cada rama',
      '¡Todos en casa!','Las familias están juntas otra vez.','Nivel {level} completado en {moves} movimientos.','Siguiente aventura →','Jugar otra vez',
      'Movimiento deshecho','¿Empezar de nuevo?','Se reiniciarán tus movimientos de este nivel.','Reiniciar nivel',
      'Una rama extra te ayudará a resolver el desafío','Buscando el camino a casa…','Mueve un animal de la rama {a} a la rama {b}','Deshaz tu último movimiento o agrega una rama vacía',
    ],
    menu:[
      'Aventuras del Bosque','niveles','Cambiar dificultad','Juega a tu ritmo','El progreso de cada modo se guarda por separado.',
      'Consigue 3 estrellas si alcanzas la meta de movimientos. Puedes terminar el nivel aunque la superes.','Animación','activada','desactivada','Idioma','Modo de dificultad','Guía de voz','Guía de voz activada',
    ],
  });
  add('vi','Tiếng Việt','vi-VN',{
    names:['Cáo con','Thỏ con','Gấu mèo','Gấu con','Mèo con','Gấu trúc'],
    chapters:['Rừng Trăng Sáng','Thung Lũng Đom Đóm','Khu Rừng Bí Mật'],
    modes:['Thư giãn','Phiêu lưu','Chuyên gia'],
    modeDetails:['3 loài thú · 3 cành trống · chơi thật thư giãn','5 loài thú · 2 cành trống · thử thách thú vị','6 loài thú · 1 cành trống · thú ẩn mình'],
    core:[
      'Chọn màn','Bật âm thanh','Tắt âm thanh','MÀN','Gom các bạn thú giống nhau lên cùng một cành',
      'Cành','Các cành cây','trống','lượt','Hoàn tác','Gợi ý','Chơi lại','Cành','Bước nhỏ thôi, ôm thật nhiều.','Tiếp tục chơi',
    ],
    feedback:[
      'Giờ hãy chọn cành trống hoặc bạn thú cùng loài','Chỉ được nhảy sang cành trống hoặc nơi có thú cùng loài','Gom bốn bạn thú giống nhau trên mỗi cành',
      'Về nhà cả rồi!','Các gia đình lại được bên nhau.','Hoàn thành màn {level} sau {moves} lượt.','Cuộc phiêu lưu tiếp theo →','Chơi lại',
      'Đã hoàn tác','Bắt đầu lại nhé?','Số lượt ở màn này sẽ được đặt lại.','Chơi lại màn',
      'Thêm một cành giúp bạn có chỗ để giải đố','Đang tìm đường về nhà…','Chuyển thú từ cành {a} sang cành {b}','Hoàn tác lượt vừa rồi hoặc thêm cành trống',
    ],
    menu:[
      'Phiêu Lưu Trong Rừng','màn','Đổi độ khó','Chọn nhịp chơi của bạn','Tiến trình mỗi chế độ được lưu riêng.',
      'Đạt mục tiêu số lượt để nhận 3 sao. Bạn vẫn có thể hoàn thành màn nếu vượt mục tiêu.','Hoạt ảnh','bật','tắt','Ngôn ngữ','Chế độ khó','Hướng dẫn bằng giọng nói','Đã bật hướng dẫn giọng nói',
    ],
  });

  add('ur','اردو','ur-PK',{
    names:['لومڑی کا بچہ','خرگوش','ریکون','ریچھ کا بچہ','بلی کا بچہ','پانڈا'],
    chapters:['چاندنی کا جنگل','جگنوؤں کی وادی','پراسرار جنگل'],
    modes:['آرام دہ','مہم','ماہر'],
    modeDetails:['3 جانور · 3 خالی شاخیں · آرام سے کھیلیں','5 جانور · 2 خالی شاخیں · زیادہ مشکل پہیلیاں','6 جانور · 1 خالی شاخ · چھپے ہوئے جانور'],
    core:[
      'لیول منتخب کریں','آواز چلائیں','آواز بند کریں','لیول','ایک جیسے جانوروں کو ایک ہی شاخ پر جمع کریں',
      'شاخ','جانوروں کی شاخیں','خالی','چالیں','واپس','اشارہ','دوبارہ','شاخ','چھوٹے قدم، ڈھیروں پیار۔','کھیل جاری رکھیں',
    ],
    feedback:[
      'اب خالی شاخ یا اسی قسم کا جانور منتخب کریں','صرف خالی شاخ یا ایک جیسے جانوروں کے پاس جا سکتے ہیں','ہر شاخ پر چار ایک جیسے جانور جمع کریں',
      'سب گھر پہنچ گئے!','خاندان پھر سے اکٹھے ہو گئے۔','لیول {level} کو {moves} چالوں میں مکمل کیا۔','اگلی مہم →','پھر کھیلیں',
      'چال واپس ہو گئی','دوبارہ شروع کریں؟','اس لیول کی چالیں دوبارہ صفر ہو جائیں گی۔','لیول دوبارہ شروع کریں',
      'ایک اضافی شاخ پہیلی حل کرنے میں مدد دے گی','گھر کا راستہ ڈھونڈ رہے ہیں…','جانور کو شاخ {a} سے شاخ {b} پر لے جائیں','آخری چال واپس کریں یا خالی شاخ شامل کریں',
    ],
    menu:[
      'جنگل کی مہمات','لیول','مشکل بدلیں','اپنی رفتار منتخب کریں','ہر موڈ کی پیش رفت الگ محفوظ ہوتی ہے۔',
      'مقررہ چالوں میں حل کر کے 3 ستارے حاصل کریں۔ زیادہ چالوں کے بعد بھی لیول مکمل کر سکتے ہیں۔','حرکت پذیری','چالو','بند','زبان','مشکل کا موڈ','بول کر رہنمائی','بول کر رہنمائی چالو ہے',
    ],
  });

  add('tr','Türkçe','tr-TR',{
    names:['Tilki yavrusu','Tavşan','Rakun','Ayıcık','Yavru kedi','Panda'],
    chapters:['Ay Işığı Korusu','Ateşböceği Vadisi','Gizli Orman'],
    modes:['Rahat','Macera','Uzman'],
    modeDetails:['3 hayvan türü · 3 boş dal · sakin bir oyun','5 hayvan türü · 2 boş dal · daha zor bulmacalar','6 hayvan türü · 1 boş dal · gizli hayvanlar'],
    core:[
      'Bölüm seç','Sesi aç','Sesi kapat','BÖLÜM','Aynı hayvanları tek dalda buluştur',
      'Dal','Hayvanların bulunduğu dallar','boş','hamle','Geri al','İpucu','Yeniden','Dal','Küçük adımlar, kocaman sarılmalar.','Oyuna devam et',
    ],
    feedback:[
      'Şimdi boş bir dal ya da aynı türden hayvan seç','Yalnızca boş bir dala veya aynı türün yanına zıplayabilirsin','Her dalda aynı türden dört hayvanı topla',
      'Herkes evinde!','Aileler yeniden kavuştu.','Bölüm {level}, {moves} hamlede tamamlandı.','Sıradaki macera →','Tekrar oyna',
      'Hamle geri alındı','Baştan başlansın mı?','Bu bölümdeki hamlelerin sıfırlanacak.','Bölümü yeniden başlat',
      'Ek bir dal, bulmacayı çözmen için yer açar','Evin yolunu arıyoruz…','Hayvanı {a}. daldan {b}. dala taşı','Son hamleyi geri al veya boş bir dal ekle',
    ],
    menu:[
      'Orman Maceraları','bölüm','Zorluğu değiştir','Kendi hızında oyna','Her modun ilerlemesi ayrı kaydedilir.',
      'Hamle hedefine ulaş ve 3 yıldız kazan. Hedefi aşsan da bölümü tamamlayabilirsin.','Animasyon','açık','kapalı','Dil','Zorluk modu','Sesli rehber','Sesli rehber açık',
    ],
  });

  add('fil','Filipino','fil-PH',{
    names:['Anak na soro','Kuneho','Rakun','Anak na oso','Kuting','Panda'],
    chapters:['Gubat sa Liwanag ng Buwan','Lambak ng Alitaptap','Lihim na Gubat'],
    modes:['Relax','Pakikipagsapalaran','Eksperto'],
    modeDetails:['3 uri ng hayop · 3 ekstrang sanga · chill lang','5 uri ng hayop · 2 ekstrang sanga · mas mahirap na puzzle','6 uri ng hayop · 1 ekstrang sanga · may nakatagong hayop'],
    core:[
      'Pumili ng level','I-on ang tunog','I-off ang tunog','LEVEL','Pagsamahin ang magkakaparehong hayop sa isang sanga',
      'Sanga','Mga sanga ng hayop','walang laman','galaw','I-undo','Hint','Ulitin','Sanga','Munting hakbang, mahigpit na yakap.','Ituloy ang laro',
    ],
    feedback:[
      'Pumili ng bakanteng sanga o kaparehong hayop','Sa bakanteng sanga o kaparehong hayop lang puwedeng lumipat','Magsama ng apat na magkakaparehong hayop sa bawat sanga',
      'Nasa bahay na silang lahat!','Magkakasama na ulit ang mga pamilya.','Natapos ang level {level} sa {moves} galaw.','Susunod na adventure →','Maglaro ulit',
      'Na-undo ang galaw','Simulan ulit?','Mare-reset ang mga galaw mo sa level na ito.','Ulitin ang level',
      'Makakatulong ang ekstrang sanga para masolusyunan ang puzzle','Hinahanap ang daan pauwi…','Ilipat ang hayop mula sanga {a} papunta sa sanga {b}','I-undo ang huling galaw o magdagdag ng bakanteng sanga',
    ],
    menu:[
      'Mga Adventure sa Gubat','level','Palitan ang hirap','Piliin ang bilis mo','Hiwalay na nase-save ang progress sa bawat mode.',
      'Abutin ang target na galaw para sa 3 star. Puwede mo pa ring tapusin ang level kahit lumampas.','Animation','naka-on','naka-off','Wika','Antas ng hirap','Gabay na boses','Naka-on ang gabay na boses',
    ],
  });
  add('ru','Русский','ru-RU',{
    names:['Лисёнок','Зайчик','Енот','Медвежонок','Котёнок','Панда'],
    chapters:['Лунная роща','Долина светлячков','Тайный лес'],
    modes:['Уютный','Приключение','Эксперт'],
    modeDetails:['3 вида зверят · 3 запасные ветки · игра без спешки','5 видов · 2 запасные ветки · больше комбинаций','6 видов · 1 запасная ветка · скрытые зверята'],
    core:[
      'Выбрать уровень','Включить звук','Выключить звук','УРОВЕНЬ','Собери одинаковых зверят на одной ветке',
      'Ветка','Ветки со зверятами','пустая','ходов','Назад','Подсказка','Заново','Ветка','Маленькие шаги. Большие объятия.','Продолжить игру',
    ],
    feedback:[
      'Выбери пустую ветку или такого же зверька','Прыгать можно только на пустую ветку или к своему виду','Собери по четыре одинаковых зверька на каждой ветке',
      'Все дома!','Семьи снова вместе.','Уровень {level} пройден за {moves} ходов.','Следующее приключение →','Играть снова',
      'Ход отменён','Начать заново?','Текущие ходы этого уровня будут сброшены.','Перезапустить уровень',
      'Дополнительная ветка поможет решить головоломку','Ищем дорогу домой…','Перенеси зверька с ветки {a} на ветку {b}','Отмени последний ход или добавь пустую ветку',
    ],
    menu:[
      'Лесные приключения','уровней','Изменить сложность','Выбери свой темп','Прогресс каждого режима сохраняется отдельно.',
      'Уложись в цель по ходам и получи 3 звезды. Уровень можно пройти и после превышения цели.','Анимация','включена','выключена','Язык','Режим сложности','Голосовые подсказки','Голосовые подсказки включены',
    ],
  });

  add('zh','简体中文','zh-CN',{
    names:['小狐狸','小兔子','小浣熊','小熊','小猫咪','熊猫'],
    chapters:['月光林地','萤火虫山谷','神秘森林'],
    modes:['轻松','冒险','专家'],
    modeDetails:['3 种动物 · 3 根备用树枝 · 轻松游玩','5 种动物 · 2 根备用树枝 · 更多挑战','6 种动物 · 1 根备用树枝 · 隐藏动物'],
    core:[
      '选择关卡','开启音效','关闭音效','关卡','把相同的小动物聚到同一根树枝上',
      '树枝','动物树枝','空','步','撤销','提示','重来','树枝','小小的脚步，大大的拥抱。','继续游戏',
    ],
    feedback:[
      '请选择空树枝或同类小动物','只能跳到空树枝或同类动物身边','让每根树枝上聚齐四只相同的动物',
      '大家都到家啦！','小动物们又团聚了。','第 {level} 关用 {moves} 步完成。','下一段冒险 →','再玩一次',
      '已撤销一步','重新开始吗？','本关的步数将重置。','重新开始本关',
      '增加一根树枝，更容易解开谜题','正在寻找回家的路…','把动物从第 {a} 根树枝移到第 {b} 根','撤销上一步，或增加一根空树枝',
    ],
    menu:[
      '森林奇遇','关','切换难度','按自己的节奏来','每种模式的进度单独保存。',
      '在目标步数内完成可得 3 星。超过目标也能通关。','动画','开启','关闭','语言','难度模式','语音引导','语音引导已开启',
    ],
  });

  add('ja','日本語','ja-JP',{
    names:['子ギツネ','ウサギ','アライグマ','子グマ','子ネコ','パンダ'],
    chapters:['月明かりの森','ホタルの谷','秘密の森'],
    modes:['のんびり','アドベンチャー','エキスパート'],
    modeDetails:['動物3種類・空き枝3本・のんびり遊べる','動物5種類・空き枝2本・手応えのあるパズル','動物6種類・空き枝1本・隠れた動物'],
    core:[
      'レベルを選ぶ','効果音をオン','効果音をオフ','レベル','同じ動物をひとつの枝に集めよう',
      '枝','動物のいる枝','空','手','戻す','ヒント','やり直す','枝','小さな一歩、大きなハグ。','ゲームを続ける',
    ],
    feedback:[
      '空いている枝か、同じ種類の動物を選んでね','空の枝か、同じ動物がいる枝にしか移動できないよ','それぞれの枝に同じ動物を4匹集めよう',
      'みんなおうちに帰れた！','家族がまた一緒になったよ。','レベル{level}を{moves}手でクリア！','次の冒険へ →','もう一度遊ぶ',
      '1手戻したよ','最初からやり直す？','このレベルの手数がリセットされます。','レベルをやり直す',
      '枝を1本増やすと、パズルを解きやすくなるよ','帰り道を探しているよ…','{a}番の枝から{b}番の枝へ動物を移そう','ひとつ戻すか、空の枝を増やそう',
    ],
    menu:[
      '森の冒険','レベル','難易度を変更','自分のペースで遊ぼう','モードごとに進み具合が保存されます。',
      '目標手数以内なら星3つ。超えてもクリアできるよ。','アニメーション','オン','オフ','言語','難易度','音声ガイド','音声ガイドをオンにしました',
    ],
  });

  add('ko','한국어','ko-KR',{
    names:['아기 여우','토끼','너구리','아기 곰','아기 고양이','판다'],
    chapters:['달빛 숲','반딧불 계곡','비밀의 숲'],
    modes:['느긋하게','모험','전문가'],
    modeDetails:['동물 3종 · 빈 나뭇가지 3개 · 편안한 플레이','동물 5종 · 빈 나뭇가지 2개 · 더 깊은 퍼즐','동물 6종 · 빈 나뭇가지 1개 · 숨겨진 동물'],
    core:[
      '레벨 선택','효과음 켜기','효과음 끄기','레벨','같은 동물을 한 나뭇가지에 모아 주세요',
      '나뭇가지','동물 나뭇가지','비어 있음','번 이동','되돌리기','힌트','다시 시작','가지','작은 발걸음, 커다란 포옹.','계속하기',
    ],
    feedback:[
      '빈 가지나 같은 종류의 동물을 선택하세요','빈 가지나 같은 동물이 있는 곳으로만 이동할 수 있어요','각 가지에 같은 동물 네 마리를 모으세요',
      '모두 집에 왔어요!','가족들이 다시 만났어요.','레벨 {level}, {moves}번 이동으로 완료!','다음 모험 →','다시 플레이',
      '이동을 취소했어요','처음부터 다시 할까요?','이 레벨의 이동 횟수가 초기화됩니다.','레벨 다시 시작',
      '가지를 하나 더 추가하면 퍼즐을 풀기 쉬워져요','집으로 가는 길을 찾는 중…','{a}번 가지에서 {b}번 가지로 동물을 옮기세요','마지막 이동을 취소하거나 빈 가지를 추가하세요',
    ],
    menu:[
      '숲속 모험','레벨','난이도 변경','내 속도에 맞춰 즐기세요','모드별 진행 상황이 따로 저장됩니다.',
      '목표 이동 횟수 안에 완료하면 별 3개! 넘어도 레벨을 완료할 수 있어요.','애니메이션','켜짐','꺼짐','언어','난이도 모드','음성 안내','음성 안내가 켜졌어요',
    ],
  });
  add('de','Deutsch','de-DE',{
    names:['Fuchsjunges','Häschen','Waschbär','Bärenjunges','Kätzchen','Panda'],
    chapters:['Mondscheinhain','Glühwürmchental','Geheimniswald'],
    modes:['Gemütlich','Abenteuer','Profi'],
    modeDetails:['3 Tierarten · 3 freie Äste · ganz entspannt','5 Tierarten · 2 freie Äste · kniffligere Rätsel','6 Tierarten · 1 freier Ast · versteckte Tiere'],
    core:[
      'Level wählen','Ton einschalten','Ton ausschalten','LEVEL','Bringe gleiche Tiere auf einem Ast zusammen',
      'Ast','Äste mit Tieren','leer','Züge','Rückgängig','Tipp','Neustart','Ast','Kleine Schritte. Große Umarmungen.','Weiterspielen',
    ],
    feedback:[
      'Wähle jetzt einen freien Ast oder ein passendes Tier','Du kannst nur auf einen leeren Ast oder zu gleichen Tieren springen','Sammle vier gleiche Tiere auf jedem Ast',
      'Alle sind zu Hause!','Die Familien sind wieder vereint.','Level {level} in {moves} Zügen geschafft.','Nächstes Abenteuer →','Nochmal spielen',
      'Zug rückgängig gemacht','Neu anfangen?','Deine Züge in diesem Level werden zurückgesetzt.','Level neu starten',
      'Ein zusätzlicher Ast schafft Platz zum Knobeln','Wir suchen den Heimweg…','Bewege ein Tier von Ast {a} zu Ast {b}','Mache den letzten Zug rückgängig oder füge einen freien Ast hinzu',
    ],
    menu:[
      'Waldabenteuer','Level','Schwierigkeit ändern','Spiel in deinem Tempo','Der Fortschritt wird für jeden Modus separat gespeichert.',
      'Erreiche das Zugziel für 3 Sterne. Du kannst das Level auch mit mehr Zügen schaffen.','Animation','an','aus','Sprache','Schwierigkeitsgrad','Sprachführung','Sprachführung ist eingeschaltet',
    ],
  });

  add('fr','Français','fr-FR',{
    names:['Renardeau','Lapin','Raton laveur','Ourson','Chaton','Panda'],
    chapters:['Bois au Clair de Lune','Vallée des Lucioles','Forêt Secrète'],
    modes:['Détente','Aventure','Expert'],
    modeDetails:['3 espèces · 3 branches libres · jeu tout doux','5 espèces · 2 branches libres · défis plus corsés','6 espèces · 1 branche libre · animaux cachés'],
    core:[
      'Choisir un niveau','Activer le son','Couper le son','NIVEAU','Réunis les mêmes animaux sur une seule branche',
      'Branche','Branches avec animaux','vide','coups','Annuler','Indice','Recommencer','Branche','De petits pas, de gros câlins.','Continuer à jouer',
    ],
    feedback:[
      'Choisis une branche vide ou un animal identique','Tu peux sauter uniquement sur une branche vide ou vers le même animal','Réunis quatre animaux identiques sur chaque branche',
      'Tout le monde est rentré !','Les familles sont enfin réunies.','Niveau {level} terminé en {moves} coups.','Aventure suivante →','Rejouer',
      'Coup annulé','Recommencer à zéro ?','Tes coups de ce niveau seront remis à zéro.','Recommencer le niveau',
      'Une branche en plus te donnera de la place pour réfléchir','On cherche le chemin du retour…','Déplace un animal de la branche {a} à la branche {b}','Annule le dernier coup ou ajoute une branche vide',
    ],
    menu:[
      'Aventures en Forêt','niveaux','Changer la difficulté','Joue à ton rythme','Ta progression est enregistrée séparément pour chaque mode.',
      'Atteins le nombre de coups cible pour 3 étoiles. Tu peux finir même en le dépassant.','Animations','activées','désactivées','Langue','Mode de difficulté','Guide vocal','Le guide vocal est activé',
    ],
  });

  add('ar','العربية','ar-SA',{
    names:['ثعلب صغير','أرنب','راكون','دب صغير','قطة صغيرة','باندا'],
    chapters:['غابة ضوء القمر','وادي اليراعات','الغابة السرية'],
    modes:['هادئ','مغامرة','خبير'],
    modeDetails:['3 أنواع · 3 أغصان فارغة · لعب مريح','5 أنواع · غصنان فارغان · ألغاز أصعب','6 أنواع · غصن فارغ واحد · حيوانات مخفية'],
    core:[
      'اختر المستوى','تشغيل الصوت','إيقاف الصوت','المستوى','اجمع الحيوانات المتشابهة على الغصن نفسه',
      'غصن','أغصان الحيوانات','فارغ','حركات','تراجع','تلميح','إعادة','غصن','خطوات صغيرة، وأحضان كبيرة.','متابعة اللعب',
    ],
    feedback:[
      'اختر الآن غصنًا فارغًا أو حيوانًا مماثلًا','يمكن القفز فقط إلى غصن فارغ أو بجانب حيوان من النوع نفسه','اجمع أربعة حيوانات متشابهة على كل غصن',
      'عاد الجميع إلى البيت!','اجتمعت العائلات من جديد.','اكتمل المستوى {level} خلال {moves} حركة.','المغامرة التالية ←','العب مجددًا',
      'تم التراجع عن الحركة','هل نبدأ من جديد؟','ستُعاد حركات هذا المستوى إلى الصفر.','إعادة المستوى',
      'سيساعدك غصن إضافي على حل اللغز','نبحث عن طريق العودة…','انقل حيوانًا من الغصن {a} إلى الغصن {b}','تراجع عن الحركة الأخيرة أو أضف غصنًا فارغًا',
    ],
    menu:[
      'مغامرات الغابة','مستوى','تغيير الصعوبة','العب على راحتك','يُحفظ تقدم كل نمط بشكل منفصل.',
      'حقق هدف الحركات لتحصل على 3 نجوم. يمكنك إنهاء المستوى حتى لو تجاوزته.','الرسوم المتحركة','مفعّلة','متوقفة','اللغة','مستوى الصعوبة','إرشاد صوتي','تم تشغيل الإرشاد الصوتي',
    ],
  });

  add('th','ไทย','th-TH',{
    names:['ลูกสุนัขจิ้งจอก','กระต่าย','แร็กคูน','ลูกหมี','ลูกแมว','แพนด้า'],
    chapters:['ป่าแสงจันทร์','หุบเขาหิ่งห้อย','ป่าลึกลับ'],
    modes:['สบาย ๆ','ผจญภัย','ผู้เชี่ยวชาญ'],
    modeDetails:['สัตว์ 3 ชนิด · กิ่งว่าง 3 กิ่ง · เล่นสบาย ๆ','สัตว์ 5 ชนิด · กิ่งว่าง 2 กิ่ง · ปริศนาท้าทายขึ้น','สัตว์ 6 ชนิด · กิ่งว่าง 1 กิ่ง · มีสัตว์ซ่อนอยู่'],
    core:[
      'เลือกระดับ','เปิดเสียง','ปิดเสียง','ระดับ','พาสัตว์ชนิดเดียวกันมาอยู่บนกิ่งเดียวกัน',
      'กิ่ง','กิ่งไม้ของสัตว์','ว่าง','ครั้ง','ย้อนกลับ','คำใบ้','เริ่มใหม่','กิ่ง','ก้าวเล็ก ๆ กอดอุ่น ๆ','เล่นต่อ',
    ],
    feedback:[
      'ตอนนี้เลือกกิ่งว่างหรือสัตว์ชนิดเดียวกัน','ย้ายไปได้เฉพาะกิ่งว่างหรือกิ่งที่มีสัตว์ชนิดเดียวกัน','รวมสัตว์ชนิดเดียวกันให้ครบสี่ตัวในแต่ละกิ่ง',
      'กลับบ้านกันครบแล้ว!','ทุกครอบครัวได้อยู่พร้อมหน้ากันอีกครั้ง','ผ่านระดับ {level} ใน {moves} ครั้ง','การผจญภัยต่อไป →','เล่นอีกครั้ง',
      'ย้อนกลับแล้ว','เริ่มใหม่ไหม?','จำนวนครั้งที่ย้ายในระดับนี้จะถูกรีเซ็ต','เริ่มระดับใหม่',
      'กิ่งเพิ่มช่วยให้มีที่แก้ปริศนามากขึ้น','กำลังหาทางกลับบ้าน…','ย้ายสัตว์จากกิ่ง {a} ไปกิ่ง {b}','ย้อนกลับครั้งล่าสุดหรือเพิ่มกิ่งว่าง',
    ],
    menu:[
      'ผจญภัยในป่า','ระดับ','เปลี่ยนความยาก','เล่นในจังหวะของคุณ','ระบบบันทึกความคืบหน้าแต่ละโหมดแยกกัน',
      'ทำตามเป้าหมายจำนวนครั้งเพื่อรับ 3 ดาว แม้เกินเป้าก็ยังผ่านระดับได้','แอนิเมชัน','เปิด','ปิด','ภาษา','โหมดความยาก','คำแนะนำด้วยเสียง','เปิดคำแนะนำด้วยเสียงแล้ว',
    ],
  });
})();
