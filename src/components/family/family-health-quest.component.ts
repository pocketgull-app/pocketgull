/**
 * Multilingual Family Health Hero Quest Component.
 * Interactive and printable family health adventure supporting 9 global languages:
 * English, Spanish, French, German, Chinese, Japanese, Hindi, Arabic, and Portuguese.
 *
 * @module components/family/family-health-quest
 */
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi' | 'ar' | 'pt';

export interface ILanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
  isRtl?: boolean;
}

export interface IFamilyMissionItem {
  id: string;
  emoji: string;
  title: string;
  role: string;
  scienceRationale: string;
  kidAction: string;
  badgeName: string;
}

export interface ILocalizedQuestContent {
  headerTag: string;
  subtitle: string;
  title: string;
  description: string;
  missionsDone: string;
  scienceLabel: string;
  fridgeTitle: string;
  fridgeDesc: string;
  printBtn: string;
  missions: IFamilyMissionItem[];
}

export const QUEST_TRANSLATIONS: Record<SupportedLanguage, ILocalizedQuestContent> = {
  en: {
    headerTag: 'Kid-Powered Health Coaching',
    subtitle: 'Daily Family Health Adventures',
    title: 'Family Health Hero Quests 🌟',
    description: "Empowering kids to be their parents' health champions—turning daily walking, healthy eating, hydration, and restful sleep into a shared family game.",
    missionsDone: 'Missions Done',
    scienceLabel: 'Science:',
    fridgeTitle: 'Printable Refrigerator Quest Chart',
    fridgeDesc: 'Download and print a fun weekly badge sheet for kids to stick on the fridge and stamp each night!',
    printBtn: 'Print Quest Sheet',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'After-Dinner Walk Expedition',
        role: 'Family Step Captain',
        kidAction: 'Invite Mom or Dad for a 15-minute neighborhood walk. Spot 3 dogs, birds, or cool trees along the way!',
        scienceRationale: '15-minute post-meal walking reduces blood sugar spikes by 30% and activates restorative parasympathetic calming.',
        badgeName: 'Trailblazer Star'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'Rainbow Plate Challenge',
        role: 'Kitchen Sous Chef',
        kidAction: 'Help pick out 3 different colorful foods (like green broccoli, red peppers, and orange carrots) for dinner.',
        scienceRationale: 'Diverse phytonutrients and dietary fiber nurture the gut microbiome and protect long-term cardiovascular health.',
        badgeName: 'Rainbow Master'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'Hydration & Screen Break Officer',
        role: 'Hydration Captain',
        kidAction: 'Bring your parent a fresh glass of water with a lemon slice while they work, and remind them to look out the window for 20 seconds!',
        scienceRationale: 'Proper hydration prevents mental fatigue, while the 20-20-20 rule prevents digital eye strain and headaches.',
        badgeName: 'Hydra Hero'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'Bedtime Wind-Down DJ',
        role: 'Sleep Guardian',
        kidAction: 'Help put phones to bed in a "parking lot" basket 30 minutes before bedtime and pick a relaxing book chapter to read together.',
        scienceRationale: 'Blue light cessation triggers natural melatonin secretion and optimizes deep non-REM restorative sleep cycles.',
        badgeName: 'Dream Catcher'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: 'Laughter & Daily Check-In Rx',
        role: 'Chief Happiness Officer',
        kidAction: 'Ask your parent: "What was the most fun thing that happened today?" and give them a big, genuine 10-second hug!',
        scienceRationale: '10-second hugs release oxytocin and stimulate the vagus nerve, immediately lowering cortisol and blood pressure.',
        badgeName: 'Heart of Gold'
      }
    ]
  },
  es: {
    headerTag: 'Salud Familiar Guiada por Niños',
    subtitle: 'Aventuras Diarias de Salud Familiar',
    title: 'Misiones de Héroes de la Salud 🌟',
    description: 'Empoderando a los niños para cuidar la salud de sus padres: caminar, comer sano, hidratarse y dormir bien como un juego familiar.',
    missionsDone: 'Misiones Listas',
    scienceLabel: 'Ciencia:',
    fridgeTitle: 'Tabla Imprimible para el Refrigerador',
    fridgeDesc: '¡Descarga e imprime una divertida hoja semanal de sellos para pegar en la nevera!',
    printBtn: 'Imprimir Misiones',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'Expedición de Caminata Post-Cena',
        role: 'Capitán de Pasos',
        kidAction: '¡Invita a mamá o papá a caminar 15 minutos por el vecindario y busca 3 perros, pájaros o árboles geniales!',
        scienceRationale: 'Caminar 15 minutos después de comer reduce los picos de glucosa un 30% y activa la calma parasimpática.',
        badgeName: 'Estrella Exploradora'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'Desafío del Plato Arcoíris',
        role: 'Sous Chef de Cocina',
        kidAction: 'Ayuda a elegir 3 alimentos de colores diferentes (como brócoli verde, pimientos rojos y zanahorias) para la cena.',
        scienceRationale: 'Los fitonutrientes y la fibra alimentan la microbiota intestinal y cuidan la salud cardiovascular.',
        badgeName: 'Maestro Arcoíris'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'Oficial de Hidratación y Descanso',
        role: 'Capitán de Hidratación',
        kidAction: '¡Llévale a tu padre un vaso de agua fresca con limón mientras trabaja y recuérdale mirar por la ventana 20 segundos!',
        scienceRationale: 'La hidratación combate la fatiga mental y la regla 20-20-20 previene la fatiga visual por pantallas.',
        badgeName: 'Héroe del Agua'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'DJ del Buen Dormir',
        role: 'Guardián del Sueño',
        kidAction: 'Guarden los teléfonos en una canasta 30 minutos antes de dormir y elijan un capítulo de un libro para leer juntos.',
        scienceRationale: 'Apagar las pantallas activa la melatonina natural y favorece el sueño profundo y reparador.',
        badgeName: 'Atrapasueños'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: 'Abrazo de 10 Segundos y Risas',
        role: 'Oficial de Felicidad',
        kidAction: 'Pregunta: "¿Qué fue lo más divertido de tu día hoy?" y dale a tu papá o mamá un abrazo apretado de 10 segundos.',
        scienceRationale: 'Los abrazos liberan oxitocina y activan el nervio vago, reduciendo el cortisol y la presión arterial al instante.',
        badgeName: 'Corazón de Oro'
      }
    ]
  },
  fr: {
    headerTag: 'Coaching Santé par les Enfants',
    subtitle: 'Aventures Santé en Famille',
    title: 'Quêtes des Héros de la Santé 🌟',
    description: 'Donner aux enfants le pouvoir d’être les champions de la santé de leurs parents à travers la marche, l’alimentation saine et le sommeil.',
    missionsDone: 'Missions Faites',
    scienceLabel: 'Science :',
    fridgeTitle: 'Tableau Imprimable pour le Frigo',
    fridgeDesc: 'Téléchargez et imprimez une fiche d’objectifs hebdomadaires à coller sur le réfrigérateur !',
    printBtn: 'Imprimer la Fiche',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'Expédition Marche Après-Dîner',
        role: 'Capitaine des Pas',
        kidAction: 'Invitez maman ou papa pour une promenade de 15 minutes. Repérez 3 animaux ou arbres en chemin !',
        scienceRationale: '15 minutes de marche après le repas réduisent la glycémie de 30% et activent la relaxation parasympathique.',
        badgeName: 'Étoile Guide'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'Défi de l’Assiette Arc-en-Ciel',
        role: 'Sous-Chef de Cuisine',
        kidAction: 'Aidez à choisir 3 légumes colorés différents (brocoli, poivrons rouges, carottes) pour le dîner.',
        scienceRationale: 'Les phytonutriments et les fibres nourrissent le microbiote intestinal et protègent le cœur.',
        badgeName: 'Maître Arc-en-Ciel'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'Officier Hydratation & Pause Écran',
        role: 'Capitaine Hydratation',
        kidAction: 'Apportez un verre d’eau fraîche avec une rondelle de citron à vos parents au travail et faites la pause 20-20-20 !',
        scienceRationale: 'L’eau prévient la fatigue cognitive et la règle 20-20-20 soulage la fatigue visuelle des écrans.',
        badgeName: 'Héros de l’Eau'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'DJ Détente du Coucher',
        role: 'Gardien du Sommeil',
        kidAction: 'Rangez les téléphones dans un panier 30 min avant le coucher et lisez un chapitre de livre ensemble.',
        scienceRationale: 'Couper la lumière bleue libère la mélatonine naturelle et favorise le sommeil profond réparateur.',
        badgeName: 'Capteur de Rêves'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: 'Câlin de 10 Secondes & Rires',
        role: 'Responsable du Bonheur',
        kidAction: 'Demandez : "Quel a été ton meilleur moment aujourd’hui ?" et faites un gros câlin de 10 secondes !',
        scienceRationale: 'Les câlins stimulent le nerf vague et libèrent de l’oxytocine, diminuant le cortisol et la tension.',
        badgeName: 'Cœur d’Or'
      }
    ]
  },
  de: {
    headerTag: 'Familien-Gesundheits-Coaching',
    subtitle: 'Tägliche Familien-Abenteuer',
    title: 'Familien-Gesundheitshelden 🌟',
    description: 'Kinder unterstützen ihre Eltern dabei, fit, gesund und voller Energie zu bleiben – als spielerisches Familien-Abenteuer.',
    missionsDone: 'Aufgaben Erledigt',
    scienceLabel: 'Wissenschaft:',
    fridgeTitle: 'Kühlschrank-Plan zum Ausdrucken',
    fridgeDesc: 'Drucke den Wochen-Plan aus und klebe ihn mit bunten Magneten an den Kühlschrank!',
    printBtn: 'Plan Drucken',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'Abendspaziergang-Expedition',
        role: 'Schritte-Kapitän',
        kidAction: 'Lade Mama oder Papa zu einem 15-minütigen Spaziergang ein. Entdeckt 3 Tiere oder schöne Bäume!',
        scienceRationale: '15 Minuten Gehen nach dem Essen senken Blutzuckerspitzen um 30% und aktivieren die Entspannung.',
        badgeName: 'Pfadfinder-Stern'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'Regenbogen-Teller Challenge',
        role: 'Küchen-Sous-Chef',
        kidAction: 'Wählt 3 verschiedenfarbige Gemüsesorten (Brokkoli, rote Paprika, Karotten) für das Abendessen aus.',
        scienceRationale: 'Bunte sekundäre Pflanzenstoffe und Ballaststoffe stärken die Darmflora und schützen das Herz.',
        badgeName: 'Regenbogen-Meister'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'Wasser- & Bildschirm-Wächter',
        role: 'Trink-Kapitän',
        kidAction: 'Bringe deinen Eltern ein frisches Glas Wasser mit Zitrone an den Schreibtisch und erinnert euch an die 20-20-20 Regel!',
        scienceRationale: 'Ausreichend Wasser beugt Müdigkeit vor und kurze Bildschirmpausen entlasten die Augen.',
        badgeName: 'Wasser-Held'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'Schlummer-DJ & Bettzeit',
        role: 'Schlaf-Wächter',
        kidAction: 'Parkt die Handys 30 Minuten vor dem Schlafen in einem Korb und lest gemeinsam eine Geschichte.',
        scienceRationale: 'Weniger Blaulicht regt die Melatonin-Produktion an und sorgt für tiefen erholsamen Schlaf.',
        badgeName: 'Traumfänger'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: '10-Sekunden-Umarme-Apotheke',
        role: 'Glücks-Beauftragter',
        kidAction: 'Frage: „Was war heute das Schönste?“ und schenke deinen Eltern eine feste 10-Sekunden-Umarmung!',
        scienceRationale: 'Umarmungen schütten Oxytocin aus, stimulieren den Vagusnerv und senken Stresshormone sofort.',
        badgeName: 'Goldenes Herz'
      }
    ]
  },
  zh: {
    headerTag: '儿童驱动的家庭健康共建',
    subtitle: '每日家庭健康探险',
    title: '家庭健康小英雄探险 🌟',
    description: '赋能孩子成为父母的健康领航员：将散步、彩虹餐盘、喝水补给和充足睡眠变成温馨的家庭游戏。',
    missionsDone: '已完成任务',
    scienceLabel: '科学原理:',
    fridgeTitle: '可打印冰箱打卡表',
    fridgeDesc: '下载并打印精美的每周健康打卡表，贴在冰箱上每晚盖章打卡！',
    printBtn: '打印打卡表',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: '晚餐后15分钟探索步道',
        role: '家庭健步小队长',
        kidAction: '邀请爸爸妈妈在小区散步15分钟，路上寻找3只小鸟、宠物狗或美丽的树木！',
        scienceRationale: '餐后散步15分钟可降低30%餐后血糖峰值，并激活副交感神经放松系统。',
        badgeName: '领航之星'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: '彩虹营养餐盘挑战',
        role: '厨房健康副主厨',
        kidAction: '晚餐时帮忙挑选3种不同颜色的蔬菜（如绿西兰花、红彩椒、橙胡萝卜）。',
        scienceRationale: '多色植物多酚与膳食纤维能滋养肠道菌群，呵护心血管长期健康。',
        badgeName: '彩虹大师'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: '水分补给与屏幕护眼专员',
        role: '补水小督导',
        kidAction: '给工作中的父母送上一杯新鲜柠檬水，并提醒他们遵守20-20-20护眼法则！',
        scienceRationale: '充足水分缓解脑疲劳，远眺20秒可有效预防眼肌紧张与屏幕头痛。',
        badgeName: '水润英雄'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: '睡前助眠放松DJ',
        role: '安睡守护神',
        kidAction: '睡前30分钟将手机放进“停放篮”，一起阅读一本好书的精选章节。',
        scienceRationale: '远离蓝光可激发褪黑素自然分泌，促进深度非快动眼睡眠修复。',
        badgeName: '美梦守护者'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: '10秒暖心拥抱与笑声处方',
        role: '首席快乐官',
        kidAction: '问问父母：“今天最开心的一件事是什么？”并送上一个真诚的10秒大拥抱！',
        scienceRationale: '10秒拥抱促进催产素释放并激活迷走神经，瞬间降低皮质醇压力与血压。',
        badgeName: '金子般的心'
      }
    ]
  },
  ja: {
    headerTag: '子どもが導く家族の健康づくり',
    subtitle: '毎日のファミリーヘルス冒険',
    title: 'ファミリー・ヘルスヒーロー大作戦 🌟',
    description: '子どもたちが家族の健康サポーターに！お散歩、レインボー食、水分補給、快眠を楽しいゲームに。',
    missionsDone: '完了したミッション',
    scienceLabel: '科学的根拠:',
    fridgeTitle: '冷蔵庫用プリントチェックシート',
    fridgeDesc: '印刷して冷蔵庫に貼れる、楽しい週間スタンプシートをダウンロード！',
    printBtn: 'シートを印刷',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: '夕食後の15分お散歩探検',
        role: 'ステップ・キャプテン',
        kidAction: 'お父さん・お母さんを15分のお散歩に誘おう！途中でワンちゃんや鳥、珍しい木を3つ見つけよう！',
        scienceRationale: '食後15分のウォーキングは血糖値スパイクを30%抑え、副交感神経を優位にしてリラックスを促します。',
        badgeName: '冒険スター'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'レインボープレート・チャレンジ',
        role: 'キッチン副シェフ',
        kidAction: '夕食に3色のカラフルな野菜（ブロッコリー、赤パプリカ、ニンジンなど）を一緒に選ぼう！',
        scienceRationale: '豊富なフィトケミカルと食物繊維が腸内細菌を育み、心血管の健康を守ります。',
        badgeName: 'レインボー・マスター'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: '水分補給＆目のリフレッシュ係',
        role: 'ハイドレーション・リーダー',
        kidAction: 'デスクワーク中のお父さん・お母さんにレモン水を届けて、20秒間遠くを見る休憩を促そう！',
        scienceRationale: '水分補給で脳の疲労を防ぎ、20-20-20ルールでVDT症候群（目の疲れ）を予防します。',
        badgeName: 'ハイドラ・ヒーロー'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'おやすみリラックスDJ',
        role: '快眠ガーディアン',
        kidAction: '寝る30分前にはスマホを「おやすみボックス」に入れて、本を一緒に読もう！',
        scienceRationale: 'ブルーライトを遮断することでメラトニン分泌が促進され、深いノンレム睡眠が得られます。',
        badgeName: 'ドリーム・キャッチャー'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: '10秒ハグ＆笑顔の処方箋',
        role: 'ハピネス・リーダー',
        kidAction: '「今日いちばん楽しかったことは何？」と聞いて、ぎゅっと10秒間ハグしよう！',
        scienceRationale: '10秒のハグでオキシトシンが分泌され、迷走神経が刺激されてストレスホルモンが低下します。',
        badgeName: 'ゴールド・ハート'
      }
    ]
  },
  hi: {
    headerTag: 'बच्चों द्वारा पारिवारिक स्वास्थ्य प्रेरणा',
    subtitle: 'दैनिक पारिवारिक स्वास्थ्य मिशन',
    title: 'फैमिली हेल्थ हीरो क्वेस्ट 🌟',
    description: 'बच्चों को माता-पिता का स्वास्थ्य संरक्षक बनाएं - टहलना, पौष्टिक भोजन, पानी और गहरी नींद को एक मजेदार खेल बनाएं।',
    missionsDone: 'मिशन पूरे हुए',
    scienceLabel: 'विज्ञान:',
    fridgeTitle: 'फ्रिज पर लगाने योग्य प्रिंट चार्ट',
    fridgeDesc: 'बच्चों के लिए साप्ताहिक प्रिंटेड चार्ट डाउनलोड करें और हर रात फ्रिज पर स्टैम्प लगाएं!',
    printBtn: 'चार्ट प्रिंट करें',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'रात के खाने के बाद 15 मिनट की सैर',
        role: 'स्टेप्स कैप्टन',
        kidAction: 'मम्मी-पापा को 15 मिनट की सैर पर ले जाएं और रास्ते में 3 पक्षी या सुंदर पेड़ देखें!',
        scienceRationale: 'भोजन के बाद 15 मिनट टहलने से ब्लड शुगर 30% तक नियंत्रित रहता है और तनाव कम होता है।',
        badgeName: 'ट्रेलब्लेज़र स्टार'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'इंद्रधनुष थाली चुनौती',
        role: 'किचन शेफ साथी',
        kidAction: 'रात के खाने में 3 अलग-अलग रंगों की सब्जियां (जैसे ब्रोकली, शिमला मिर्च, गाजर) शामिल करें।',
        scienceRationale: 'रंग-बिरंगे पोषक तत्व और फाइबर पेट के स्वास्थ्य और हृदय को मजबूत बनाते हैं।',
        badgeName: 'इंद्रधनुष मास्टर'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'जल व स्क्रीन विश्राम अधिकारी',
        role: 'हाइड्रेशन कैप्टन',
        kidAction: 'काम करते समय माता-पिता को नींबू पानी दें और 20 सेकंड के लिए खिड़की से बाहर देखने को कहें!',
        scienceRationale: 'पर्याप्त पानी मानसिक थकान रोकता है और 20-20-20 नियम आंखों को आराम देता है।',
        badgeName: 'जल नायक'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'सोने से पहले शांत संगीत व पुस्तक',
        role: 'नींद रक्षक',
        kidAction: 'सोने से 30 मिनट पहले फोन को अलग रखें और साथ में कोई अच्छी किताब पढ़ें।',
        scienceRationale: 'स्क्रीन से दूरी मेलाटोनिन हार्मोन को बढ़ाती है और गहरी आरामदायक नींद लाती है।',
        badgeName: 'सपना रक्षक'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: '10-सेकंड का सच्चा गले मिलना',
        role: 'खुशी अधिकारी',
        kidAction: 'पूछें: "आज आपका सबसे अच्छा पल क्या था?" और माता-पिता को 10 सेकंड का प्यारा हग दें!',
        scienceRationale: 'गले मिलने से ऑक्सीटोसिन रिलीज होता है, जिससे तनाव और ब्लड प्रेशर तुरंत कम होता है।',
        badgeName: 'गोल्डन हार्ट'
      }
    ]
  },
  ar: {
    headerTag: 'رعاية صحية بقيادة الأطفال',
    subtitle: 'مغامرات الصحة العائلية اليومية',
    title: 'مهمات أبطال الصحة العائلية 🌟',
    description: 'تمكين الأطفال ليكونوا أبطال صحة والديهم: تحويل المشي، والغذاء الصحي، وشرب الماء، والنوم الهادئ إلى مغامرة عائلية.',
    missionsDone: 'المهمات المنجزة',
    scienceLabel: 'العلم:',
    fridgeTitle: 'جدول الثلاجة القابل للطباعة',
    fridgeDesc: 'اطبع جدول الإنجازات الأسبوعي لتعليقه على الثلاجة والمتابعة اليومية!',
    printBtn: 'طباعة الجدول',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'جولة المشي بعد العشاء',
        role: 'قائد الخطوات',
        kidAction: 'ادعُ والديك للمشي لمدة 15 دقيقة واكتشفوا 3 أشجار أو طيور مميزة في الحي!',
        scienceRationale: 'المشي 15 دقيقة بعد الوجبة يخفض ارتفاع السكر بنسبة 30% ويحفز الاسترخاء العصبي.',
        badgeName: 'نجم الاستكشاف'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'تحدي طبق قوس قزح',
        role: 'مساعد الشيف الصغير',
        kidAction: 'ساعد في اختيار 3 أطعمة ملونة مختلفة (مثل البروكلي والفلفل والجزر) للعشاء.',
        scienceRationale: 'المغذيات النباتية والألياف تعزز صحة الجهاز الهضمي والقلب على المدى الطويل.',
        badgeName: 'بطل قوس قزح'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'مسؤول شرب الماء والراحة',
        role: 'قائد الترطيب',
        kidAction: 'قدّم لوالديك كوب ماء بالليمون أثناء العمل وذكّرهما بالنظر بعيداً لمدة 20 ثانية!',
        scienceRationale: 'الترطيب يمنع الإجهاد الذهني، وقاعدة 20-20-20 تحمي العينين من إجهاد الشاشات.',
        badgeName: 'بطل الماء'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'حارس النوم والاسترخاء',
        role: 'حارس الأحلام',
        kidAction: 'ضعوا الهواتف جانباً قبل النوم بـ 30 دقيقة واقرؤوا فصلاً من كتاب معاً.',
        scienceRationale: 'الابتعاد عن الضوء الأزرق يحفز إفراز الميلاتونين ويعزز النوم العميق المريح.',
        badgeName: 'صائد الأحلام'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: 'عناق 10 ثوانٍ وجرعة الابتسامة',
        role: 'مسؤول السعادة',
        kidAction: 'اسأل: "ما هو أجمل شيء حدث معك اليوم؟" وامنح والديك عناقاً دافئاً لمدة 10 ثوانٍ!',
        scienceRationale: 'العناق يفرز هرمون الأوكسيتوسين ويقلل التوتر وضغط الدم فوراً.',
        badgeName: 'القلب الذهبي'
      }
    ]
  },
  pt: {
    headerTag: 'Saúde Familiar Guiada por Crianças',
    subtitle: 'Aventuras Diárias de Saúde em Família',
    title: 'Missões dos Heróis da Saúde 🌟',
    description: 'Capacitando as crianças a serem guardiãs da saúde dos pais: caminhadas, alimentação colorida, hidratação e sono como um jogo em família.',
    missionsDone: 'Missões Concluídas',
    scienceLabel: 'Ciência:',
    fridgeTitle: 'Tabela Imprimível para a Geladeira',
    fridgeDesc: 'Baixe e imprima uma divertida folha semanal de medalhas para colar na geladeira!',
    printBtn: 'Imprimir Tabela',
    missions: [
      {
        id: 'mission-walk',
        emoji: '🚶',
        title: 'Expedição de Caminhada Pós-Jantar',
        role: 'Capitão dos Passos',
        kidAction: 'Convide a mãe ou o pai para uma caminhada de 15 minutos e procurem 3 cachorros, pássaros ou árvores pelo caminho!',
        scienceRationale: 'Caminhar 15 minutos após as refeições reduz picos glicêmicos em 30% e ativa o relaxamento parassimpático.',
        badgeName: 'Estrela Exploradora'
      },
      {
        id: 'mission-rainbow',
        emoji: '🥗',
        title: 'Desafio do Prato Arco-Íris',
        role: 'Sous Chef da Cozinha',
        kidAction: 'Ajude a escolher 3 alimentos de cores diferentes (como brócolis verde, pimentão vermelho e cenoura) para o jantar.',
        scienceRationale: 'Fitonutrientes e fibras alimentam a microbiota intestinal e protegem o sistema cardiovascular.',
        badgeName: 'Mestre do Arco-Íris'
      },
      {
        id: 'mission-hydration',
        emoji: '💧',
        title: 'Oficial de Hidratação e Pausa',
        role: 'Capitão da Hidratação',
        kidAction: 'Leve um copo de água fresca com limão para seus pais no trabalho e lembre-os de olhar pela janela por 20 segundos!',
        scienceRationale: 'A hidratação combate a fadiga mental e a regra 20-20-20 alivia a tensão ocular das telas.',
        badgeName: 'Herói da Água'
      },
      {
        id: 'mission-sleep',
        emoji: '🌙',
        title: 'DJ do Sono Tranquilo',
        role: 'Guardião do Sono',
        kidAction: 'Guardem os celulares numa cesta 30 minutos antes de dormir e leiam um capítulo de livro juntos.',
        scienceRationale: 'Desligar as telas estimula a melatonina natural e proporciona um sono profundo e reparador.',
        badgeName: 'Apanhador de Sonhos'
      },
      {
        id: 'mission-hug',
        emoji: '❤️',
        title: 'Abraço de 10 Segundos & Risadas',
        role: 'Diretor da Felicidade',
        kidAction: 'Pergunte: "O que aconteceu de mais legal hoje?" e dê um abraço bem apertado de 10 segundos!',
        scienceRationale: 'Abraços liberam ocitocina e estimulam o nervo vago, reduzindo o cortisol e a pressão arterial na hora.',
        badgeName: 'Coração de Ouro'
      }
    ]
  }
};

@Component({
  selector: 'app-family-health-quest',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [dir]="isRtl() ? 'rtl' : 'ltr'"
      class="p-6 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
    >
      <!-- Top Language Selector Bar -->
      <div class="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <span class="text-base">🌍</span>
          <span class="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Language / Idioma:</span>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          @for (lang of languages; track lang.code) {
            <button
              type="button"
              (click)="setLanguage(lang.code)"
              [class.bg-amber-500]="activeLanguage() === lang.code"
              [class.text-white]="activeLanguage() === lang.code"
              [class.bg-zinc-100]="activeLanguage() !== lang.code"
              [class.dark:bg-zinc-900]="activeLanguage() !== lang.code"
              [class.text-zinc-700]="activeLanguage() !== lang.code"
              [class.dark:text-zinc-300]="activeLanguage() !== lang.code"
              class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1 shrink-0"
            >
              <span>{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Header Banner -->
      <div class="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 rounded-full border border-white/30">
                {{ currentContent().headerTag }}
              </span>
              <span class="text-xs text-white/90">{{ currentContent().subtitle }}</span>
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tight font-pocketgull text-white">
              {{ currentContent().title }}
            </h2>
            <p class="text-xs text-white/90 mt-0.5 max-w-xl leading-relaxed">
              {{ currentContent().description }}
            </p>
          </div>

          <!-- Progress Stars -->
          <div class="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center gap-3 shrink-0">
            <div class="text-center">
              <div class="text-2xl font-black text-white leading-none">{{ completedCount() }} / {{ currentContent().missions.length }}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-0.5">{{ currentContent().missionsDone }}</div>
            </div>
            <div class="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (m of currentContent().missions; track m.id) {
          <div
            (click)="toggleMission(m.id)"
            [class.border-emerald-500]="isCompleted(m.id)"
            [class.bg-emerald-50/40]="isCompleted(m.id)"
            [class.dark:bg-emerald-950/20]="isCompleted(m.id)"
            class="p-5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl shadow-xs">
                  {{ m.emoji }}
                </div>
                <button
                  type="button"
                  (click)="$event.stopPropagation(); toggleMission(m.id)"
                  [class.bg-emerald-500]="isCompleted(m.id)"
                  [class.text-white]="isCompleted(m.id)"
                  [class.border-emerald-500]="isCompleted(m.id)"
                  [class.bg-white]="!isCompleted(m.id)"
                  [class.dark:bg-zinc-800]="!isCompleted(m.id)"
                  [class.border-zinc-300]="!isCompleted(m.id)"
                  [class.dark:border-zinc-700]="!isCompleted(m.id)"
                  class="w-6 h-6 rounded-lg border flex items-center justify-center transition-all text-xs font-bold"
                >
                  @if (isCompleted(m.id)) {
                    ✓
                  }
                </button>
              </div>

              <div class="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                {{ m.role }} • {{ m.badgeName }}
              </div>
              <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-100 font-pocketgull mb-1">
                {{ m.title }}
              </h3>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                {{ m.kidAction }}
              </p>
            </div>

            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                <span class="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">🔬 {{ currentContent().scienceLabel }}</span>
                <span class="line-clamp-2">{{ m.scienceRationale }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Printable Fridge Tracker Section -->
      <div class="p-5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            🖨️
          </div>
          <div>
            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {{ currentContent().fridgeTitle }}
            </h4>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ currentContent().fridgeDesc }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="printQuestSheet()"
          class="px-4 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>{{ currentContent().printBtn }}</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class FamilyHealthQuestComponent {
  languages: ILanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', isRtl: true },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
  ];

  activeLanguage = signal<SupportedLanguage>('en');
  completedMissionIds = signal<Set<string>>(new Set());

  currentContent = computed(() => {
    const lang = this.activeLanguage();
    return QUEST_TRANSLATIONS[lang] || QUEST_TRANSLATIONS.en;
  });

  isRtl = computed(() => {
    return this.activeLanguage() === 'ar';
  });

  completedCount = computed(() => {
    return this.completedMissionIds().size;
  });

  setLanguage(lang: SupportedLanguage): void {
    this.activeLanguage.set(lang);
  }

  isCompleted(id: string): boolean {
    return this.completedMissionIds().has(id);
  }

  toggleMission(id: string): void {
    this.completedMissionIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  printQuestSheet(): void {
    window.print();
  }
}
