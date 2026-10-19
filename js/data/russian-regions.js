/* GeoMind — база субъектов Российской Федерации для категории
 * «🏙️ Регионы России» (89 записей) и их административных центров.
 *
 * ВЫБРАННЫЙ ПЕРЕЧЕНЬ (зафиксирован здесь как единый справочник категории):
 *   24 республики
 *    9 краёв
 *   48 областей
 *    3 города федерального значения (Москва, Санкт-Петербург, Севастополь)
 *    1 автономная область (Еврейская)
 *    4 автономных округа (Ненецкий, Ханты-Мансийский — Югра, Чукотский,
 *      Ямало-Ненецкий)
 *   Итого 89 субъектов.
 *
 * Перечень соответствует российской административно-территориальной
 * классификации (включая субъекты, образованные в 2022 году). Международно-
 * правовой статус части территорий оспаривается; в интерфейсе игры никаких
 * политических утверждений нет — только название субъекта и его
 * административный центр по выбранному справочнику.
 *
 * Поля записи:
 *   id         — уникальный идентификатор (латиница, для ключей статистики)
 *   name       — полное название субъекта (как в вопросе и вариантах ответа)
 *   gen        — родительный падеж названия (для «у …»)
 *   type       — республика | край | область | город федерального значения |
 *                автономная область | автономный округ
 *   center     — административный центр
 *   capital    — столица (только у республик; совпадает с center)
 *   district   — федеральный округ (для правдоподобных вариантов ответа;
 *                null — округ в справочнике не указан)
 *   difficulty — easy | medium | hard (подбор вопросов по уровню)
 *   note       — особенность записи (для разработчика и проверок)
 *
 * ОСОБЕННОСТИ, ЗАФИКСИРОВАННЫЕ В ДАННЫХ:
 *   • Московская область — административный центр Москва, город
 *     в состав области не входит.
 *   • Ленинградская область — административный центр Санкт-Петербург,
 *     город в состав области не входит.
 *   • Города федерального значения не имеют отдельного административного
 *     центра: center совпадает с name. Вопросы «какой центр у города»
 *     и «какой регион имеет центр Москва» были бы бессмысленными или
 *     допускали бы два ответа, поэтому такие записи в вопросы не попадают
 *     (см. js/data/questions.js), но остаются в справочнике и статистике.
 *   • Запорожская и Херсонская области, ДНР и ЛНР — административные центры
 *     указаны по российской классификации (Мелитополь, Геническ, Донецк,
 *     Луганск); федеральный округ в справочнике не указан.
 *   • Кемеровская область официально называется «Кемеровская область —
 *     Кузбасс»; в игре используется короткое название, полное — в note.
 *
 * Данные отделены от логики: генерация вопросов — js/data/questions.js.
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Data.RUSSIAN_REGIONS = [

  // ————————————— Республики (24) —————————————

  {
    id: "adygea", name: "Республика Адыгея", gen: "Республики Адыгеи",
    type: "республика", center: "Майкоп", capital: "Майкоп",
    district: "Южный", difficulty: "hard",
  },
  {
    id: "altai-republic", name: "Республика Алтай", gen: "Республики Алтай",
    type: "республика", center: "Горно-Алтайск", capital: "Горно-Алтайск",
    district: "Сибирский", difficulty: "medium",
  },
  {
    id: "bashkortostan", name: "Республика Башкортостан", gen: "Республики Башкортостан",
    type: "республика", center: "Уфа", capital: "Уфа",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "buryatia", name: "Республика Бурятия", gen: "Республики Бурятии",
    type: "республика", center: "Улан-Удэ", capital: "Улан-Удэ",
    district: "Дальневосточный", difficulty: "easy",
  },
  {
    id: "dagestan", name: "Республика Дагестан", gen: "Республики Дагестан",
    type: "республика", center: "Махачкала", capital: "Махачкала",
    district: "Северо-Кавказский", difficulty: "easy",
  },
  {
    id: "donetsk", name: "Донецкая Народная Республика", gen: "Донецкой Народной Республики",
    type: "республика", center: "Донецк", capital: "Донецк",
    district: null, difficulty: "hard",
    note: "образован в 2022 году; федеральный округ в справочнике не указан",
  },
  {
    id: "ingushetia", name: "Республика Ингушетия", gen: "Республики Ингушетии",
    type: "республика", center: "Магас", capital: "Магас",
    district: "Северо-Кавказский", difficulty: "medium",
  },
  {
    id: "kabardino-balkaria", name: "Кабардино-Балкарская Республика", gen: "Кабардино-Балкарской Республики",
    type: "республика", center: "Нальчик", capital: "Нальчик",
    district: "Северо-Кавказский", difficulty: "medium",
  },
  {
    id: "kalmykia", name: "Республика Калмыкия", gen: "Республики Калмыкии",
    type: "республика", center: "Элиста", capital: "Элиста",
    district: "Южный", difficulty: "medium",
  },
  {
    id: "karachay-cherkessia", name: "Карачаево-Черкесская Республика", gen: "Карачаево-Черкесской Республики",
    type: "республика", center: "Черкесск", capital: "Черкесск",
    district: "Северо-Кавказский", difficulty: "medium",
  },
  {
    id: "karelia", name: "Республика Карелия", gen: "Республики Карелии",
    type: "республика", center: "Петрозаводск", capital: "Петрозаводск",
    district: "Северо-Западный", difficulty: "medium",
  },
  {
    id: "komi", name: "Республика Коми", gen: "Республики Коми",
    type: "республика", center: "Сыктывкар", capital: "Сыктывкар",
    district: "Северо-Западный", difficulty: "medium",
  },
  {
    id: "crimea", name: "Республика Крым", gen: "Республики Крым",
    type: "республика", center: "Симферополь", capital: "Симферополь",
    district: "Южный", difficulty: "easy",
  },
  {
    id: "lugansk", name: "Луганская Народная Республика", gen: "Луганской Народной Республики",
    type: "республика", center: "Луганск", capital: "Луганск",
    district: null, difficulty: "hard",
    note: "образован в 2022 году; федеральный округ в справочнике не указан",
  },
  {
    id: "mari-el", name: "Республика Марий Эл", gen: "Республики Марий Эл",
    type: "республика", center: "Йошкар-Ола", capital: "Йошкар-Ола",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "mordovia", name: "Республика Мордовия", gen: "Республики Мордовии",
    type: "республика", center: "Саранск", capital: "Саранск",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "sakha", name: "Республика Саха (Якутия)", gen: "Республики Саха (Якутия)",
    type: "республика", center: "Якутск", capital: "Якутск",
    district: "Дальневосточный", difficulty: "easy",
  },
  {
    id: "north-ossetia", name: "Республика Северная Осетия — Алания", gen: "Республики Северной Осетии — Алании",
    type: "республика", center: "Владикавказ", capital: "Владикавказ",
    district: "Северо-Кавказский", difficulty: "medium",
  },
  {
    id: "tatarstan", name: "Республика Татарстан", gen: "Республики Татарстан",
    type: "республика", center: "Казань", capital: "Казань",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "tyva", name: "Республика Тыва", gen: "Республики Тывы",
    type: "республика", center: "Кызыл", capital: "Кызыл",
    district: "Сибирский", difficulty: "hard",
  },
  {
    id: "udmurtia", name: "Удмуртская Республика", gen: "Удмуртской Республики",
    type: "республика", center: "Ижевск", capital: "Ижевск",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "khakassia", name: "Республика Хакасия", gen: "Республики Хакасии",
    type: "республика", center: "Абакан", capital: "Абакан",
    district: "Сибирский", difficulty: "medium",
  },
  {
    id: "chechnya", name: "Чеченская Республика", gen: "Чеченской Республики",
    type: "республика", center: "Грозный", capital: "Грозный",
    district: "Северо-Кавказский", difficulty: "easy",
  },
  {
    id: "chuvashia", name: "Чувашская Республика", gen: "Чувашской Республики",
    type: "республика", center: "Чебоксары", capital: "Чебоксары",
    district: "Приволжский", difficulty: "easy",
  },

  // ————————————— Края (9) —————————————

  {
    id: "altai-krai", name: "Алтайский край", gen: "Алтайского края",
    type: "край", center: "Барнаул",
    district: "Сибирский", difficulty: "easy",
  },
  {
    id: "zabaykalsky-krai", name: "Забайкальский край", gen: "Забайкальского края",
    type: "край", center: "Чита",
    district: "Дальневосточный", difficulty: "medium",
  },
  {
    id: "kamchatka-krai", name: "Камчатский край", gen: "Камчатского края",
    type: "край", center: "Петропавловск-Камчатский",
    district: "Дальневосточный", difficulty: "medium",
  },
  {
    id: "krasnodar-krai", name: "Краснодарский край", gen: "Краснодарского края",
    type: "край", center: "Краснодар",
    district: "Южный", difficulty: "easy",
  },
  {
    id: "krasnoyarsk-krai", name: "Красноярский край", gen: "Красноярского края",
    type: "край", center: "Красноярск",
    district: "Сибирский", difficulty: "easy",
  },
  {
    id: "perm-krai", name: "Пермский край", gen: "Пермского края",
    type: "край", center: "Пермь",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "primorsky-krai", name: "Приморский край", gen: "Приморского края",
    type: "край", center: "Владивосток",
    district: "Дальневосточный", difficulty: "easy",
  },
  {
    id: "stavropol-krai", name: "Ставропольский край", gen: "Ставропольского края",
    type: "край", center: "Ставрополь",
    district: "Северо-Кавказский", difficulty: "easy",
  },
  {
    id: "khabarovsk-krai", name: "Хабаровский край", gen: "Хабаровского края",
    type: "край", center: "Хабаровск",
    district: "Дальневосточный", difficulty: "easy",
  },

  // ————————————— Области (48) —————————————

  {
    id: "amur-oblast", name: "Амурская область", gen: "Амурской области",
    type: "область", center: "Благовещенск",
    district: "Дальневосточный", difficulty: "hard",
  },
  {
    id: "arkhangelsk-oblast", name: "Архангельская область", gen: "Архангельской области",
    type: "область", center: "Архангельск",
    district: "Северо-Западный", difficulty: "hard",
  },
  {
    id: "astrakhan-oblast", name: "Астраханская область", gen: "Астраханской области",
    type: "область", center: "Астрахань",
    district: "Южный", difficulty: "medium",
  },
  {
    id: "belgorod-oblast", name: "Белгородская область", gen: "Белгородской области",
    type: "область", center: "Белгород",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "bryansk-oblast", name: "Брянская область", gen: "Брянской области",
    type: "область", center: "Брянск",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "vladimir-oblast", name: "Владимирская область", gen: "Владимирской области",
    type: "область", center: "Владимир",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "volgograd-oblast", name: "Волгоградская область", gen: "Волгоградской области",
    type: "область", center: "Волгоград",
    district: "Южный", difficulty: "easy",
  },
  {
    id: "vologda-oblast", name: "Вологодская область", gen: "Вологодской области",
    type: "область", center: "Вологда",
    district: "Северо-Западный", difficulty: "medium",
  },
  {
    id: "voronezh-oblast", name: "Воронежская область", gen: "Воронежской области",
    type: "область", center: "Воронеж",
    district: "Центральный", difficulty: "easy",
  },
  {
    id: "ivanovo-oblast", name: "Ивановская область", gen: "Ивановской области",
    type: "область", center: "Иваново",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "irkutsk-oblast", name: "Иркутская область", gen: "Иркутской области",
    type: "область", center: "Иркутск",
    district: "Сибирский", difficulty: "easy",
  },
  {
    id: "kaliningrad-oblast", name: "Калининградская область", gen: "Калининградской области",
    type: "область", center: "Калининград",
    district: "Северо-Западный", difficulty: "medium",
  },
  {
    id: "kaluga-oblast", name: "Калужская область", gen: "Калужской области",
    type: "область", center: "Калуга",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "kemerovo-oblast", name: "Кемеровская область", gen: "Кемеровской области",
    type: "область", center: "Кемерово",
    district: "Сибирский", difficulty: "medium",
    note: "официальное название — Кемеровская область — Кузбасс",
  },
  {
    id: "kirov-oblast", name: "Кировская область", gen: "Кировской области",
    type: "область", center: "Киров",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "kostroma-oblast", name: "Костромская область", gen: "Костромской области",
    type: "область", center: "Кострома",
    district: "Центральный", difficulty: "hard",
  },
  {
    id: "kurgan-oblast", name: "Курганская область", gen: "Курганской области",
    type: "область", center: "Курган",
    district: "Уральский", difficulty: "hard",
  },
  {
    id: "kursk-oblast", name: "Курская область", gen: "Курской области",
    type: "область", center: "Курск",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "leningrad-oblast", name: "Ленинградская область", gen: "Ленинградской области",
    type: "область", center: "Санкт-Петербург",
    district: "Северо-Западный", difficulty: "medium",
    note: "административный центр — Санкт-Петербург, город в состав области не входит",
  },
  {
    id: "lipetsk-oblast", name: "Липецкая область", gen: "Липецкой области",
    type: "область", center: "Липецк",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "magadan-oblast", name: "Магаданская область", gen: "Магаданской области",
    type: "область", center: "Магадан",
    district: "Дальневосточный", difficulty: "hard",
  },
  {
    id: "moscow-oblast", name: "Московская область", gen: "Московской области",
    type: "область", center: "Москва",
    district: "Центральный", difficulty: "medium",
    note: "административный центр — Москва, город в состав области не входит",
  },
  {
    id: "murmansk-oblast", name: "Мурманская область", gen: "Мурманской области",
    type: "область", center: "Мурманск",
    district: "Северо-Западный", difficulty: "medium",
  },
  {
    id: "nizhny-novgorod-oblast", name: "Нижегородская область", gen: "Нижегородской области",
    type: "область", center: "Нижний Новгород",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "novgorod-oblast", name: "Новгородская область", gen: "Новгородской области",
    type: "область", center: "Великий Новгород",
    district: "Северо-Западный", difficulty: "hard",
  },
  {
    id: "novosibirsk-oblast", name: "Новосибирская область", gen: "Новосибирской области",
    type: "область", center: "Новосибирск",
    district: "Сибирский", difficulty: "easy",
  },
  {
    id: "omsk-oblast", name: "Омская область", gen: "Омской области",
    type: "область", center: "Омск",
    district: "Сибирский", difficulty: "easy",
  },
  {
    id: "orenburg-oblast", name: "Оренбургская область", gen: "Оренбургской области",
    type: "область", center: "Оренбург",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "oryol-oblast", name: "Орловская область", gen: "Орловской области",
    type: "область", center: "Орёл",
    district: "Центральный", difficulty: "hard",
  },
  {
    id: "penza-oblast", name: "Пензенская область", gen: "Пензенской области",
    type: "область", center: "Пенза",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "pskov-oblast", name: "Псковская область", gen: "Псковской области",
    type: "область", center: "Псков",
    district: "Северо-Западный", difficulty: "hard",
  },
  {
    id: "rostov-oblast", name: "Ростовская область", gen: "Ростовской области",
    type: "область", center: "Ростов-на-Дону",
    district: "Южный", difficulty: "easy",
  },
  {
    id: "ryazan-oblast", name: "Рязанская область", gen: "Рязанской области",
    type: "область", center: "Рязань",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "samara-oblast", name: "Самарская область", gen: "Самарской области",
    type: "область", center: "Самара",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "saratov-oblast", name: "Саратовская область", gen: "Саратовской области",
    type: "область", center: "Саратов",
    district: "Приволжский", difficulty: "easy",
  },
  {
    id: "sakhalin-oblast", name: "Сахалинская область", gen: "Сахалинской области",
    type: "область", center: "Южно-Сахалинск",
    district: "Дальневосточный", difficulty: "hard",
  },
  {
    id: "sverdlovsk-oblast", name: "Свердловская область", gen: "Свердловской области",
    type: "область", center: "Екатеринбург",
    district: "Уральский", difficulty: "easy",
  },
  {
    id: "smolensk-oblast", name: "Смоленская область", gen: "Смоленской области",
    type: "область", center: "Смоленск",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "tambov-oblast", name: "Тамбовская область", gen: "Тамбовской области",
    type: "область", center: "Тамбов",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "tver-oblast", name: "Тверская область", gen: "Тверской области",
    type: "область", center: "Тверь",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "tomsk-oblast", name: "Томская область", gen: "Томской области",
    type: "область", center: "Томск",
    district: "Сибирский", difficulty: "medium",
  },
  {
    id: "tula-oblast", name: "Тульская область", gen: "Тульской области",
    type: "область", center: "Тула",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "tyumen-oblast", name: "Тюменская область", gen: "Тюменской области",
    type: "область", center: "Тюмень",
    district: "Уральский", difficulty: "easy",
  },
  {
    id: "ulyanovsk-oblast", name: "Ульяновская область", gen: "Ульяновской области",
    type: "область", center: "Ульяновск",
    district: "Приволжский", difficulty: "medium",
  },
  {
    id: "chelyabinsk-oblast", name: "Челябинская область", gen: "Челябинской области",
    type: "область", center: "Челябинск",
    district: "Уральский", difficulty: "easy",
  },
  {
    id: "yaroslavl-oblast", name: "Ярославская область", gen: "Ярославской области",
    type: "область", center: "Ярославль",
    district: "Центральный", difficulty: "medium",
  },
  {
    id: "zaporozhye-oblast", name: "Запорожская область", gen: "Запорожской области",
    type: "область", center: "Мелитополь",
    district: null, difficulty: "hard",
    note: "образована в 2022 году; административный центр по российской классификации — Мелитополь",
  },
  {
    id: "kherson-oblast", name: "Херсонская область", gen: "Херсонской области",
    type: "область", center: "Геническ",
    district: null, difficulty: "hard",
    note: "образована в 2022 году; административный центр по российской классификации — Геническ",
  },

  // ———————— Города федерального значения (3) ————————

  {
    id: "moscow-city", name: "Москва", gen: "Москвы",
    type: "город федерального значения", center: "Москва",
    district: "Центральный", difficulty: "easy",
    note: "город федерального значения; отдельного административного центра нет",
  },
  {
    id: "saint-petersburg", name: "Санкт-Петербург", gen: "Санкт-Петербурга",
    type: "город федерального значения", center: "Санкт-Петербург",
    district: "Северо-Западный", difficulty: "easy",
    note: "город федерального значения; отдельного административного центра нет",
  },
  {
    id: "sevastopol", name: "Севастополь", gen: "Севастополя",
    type: "город федерального значения", center: "Севастополь",
    district: "Южный", difficulty: "easy",
    note: "город федерального значения; отдельного административного центра нет",
  },

  // ————————————— Автономная область (1) —————————————

  {
    id: "jewish-autonomous-oblast", name: "Еврейская автономная область", gen: "Еврейской автономной области",
    type: "автономная область", center: "Биробиджан",
    district: "Дальневосточный", difficulty: "hard",
  },

  // ————————————— Автономные округа (4) —————————————

  {
    id: "nenets-okrug", name: "Ненецкий автономный округ", gen: "Ненецкого автономного округа",
    type: "автономный округ", center: "Нарьян-Мар",
    district: "Северо-Западный", difficulty: "hard",
  },
  {
    id: "khanty-mansi-okrug", name: "Ханты-Мансийский автономный округ — Югра", gen: "Ханты-Мансийского автономного округа — Югры",
    type: "автономный округ", center: "Ханты-Мансийск",
    district: "Уральский", difficulty: "hard",
  },
  {
    id: "chukotka-okrug", name: "Чукотский автономный округ", gen: "Чукотского автономного округа",
    type: "автономный округ", center: "Анадырь",
    district: "Дальневосточный", difficulty: "hard",
  },
  {
    id: "yamalo-nenets-okrug", name: "Ямало-Ненецкий автономный округ", gen: "Ямало-Ненецкого автономного округа",
    type: "автономный округ", center: "Салехард",
    district: "Уральский", difficulty: "hard",
  },
];
