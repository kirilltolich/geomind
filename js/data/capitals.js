/* GeoMind — база стран и столиц (120 записей).
 * Каждая запись:
 *   country     — страна (именительный падеж)
 *   gen         — родительный падеж (для «Какая столица у …?»)
 *   capital     — столица
 *   code        — ISO 3166-1 alpha-2: путь к флагу строится как
 *                 assets/flags/{code}.svg (см. js/lib/flag-image.js)
 *   difficulty  — сложность: "easy" | "medium" | "hard"
 *
 * Unicode-флаги и внешние URL здесь намеренно не хранятся:
 * используется только локальный SVG внутри проекта.
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Data = {
  CAPITALS: [

    // ————— Европа —————

    { country: "Франция", gen: "Франции", capital: "Париж", difficulty: "easy", code: "fr" },
    { country: "Германия", gen: "Германии", capital: "Берлин", difficulty: "easy", code: "de" },
    { country: "Италия", gen: "Италии", capital: "Рим", difficulty: "easy", code: "it" },
    { country: "Испания", gen: "Испании", capital: "Мадрид", difficulty: "easy", code: "es" },
    { country: "Великобритания", gen: "Великобритании", capital: "Лондон", difficulty: "easy", code: "gb" },
    { country: "Португалия", gen: "Португалии", capital: "Лиссабон", difficulty: "easy", code: "pt" },
    { country: "Нидерланды", gen: "Нидерландов", capital: "Амстердам", difficulty: "easy", code: "nl" },
    { country: "Бельгия", gen: "Бельгии", capital: "Брюссель", difficulty: "easy", code: "be" },
    { country: "Швейцария", gen: "Швейцарии", capital: "Берн", difficulty: "easy", code: "ch" },
    { country: "Австрия", gen: "Австрии", capital: "Вена", difficulty: "easy", code: "at" },
    { country: "Швеция", gen: "Швеции", capital: "Стокгольм", difficulty: "easy", code: "se" },
    { country: "Норвегия", gen: "Норвегии", capital: "Осло", difficulty: "easy", code: "no" },
    { country: "Дания", gen: "Дании", capital: "Копенгаген", difficulty: "easy", code: "dk" },
    { country: "Финляндия", gen: "Финляндии", capital: "Хельсинки", difficulty: "easy", code: "fi" },
    { country: "Ирландия", gen: "Ирландии", capital: "Дублин", difficulty: "easy", code: "ie" },
    { country: "Польша", gen: "Польши", capital: "Варшава", difficulty: "easy", code: "pl" },
    { country: "Чехия", gen: "Чехии", capital: "Прага", difficulty: "easy", code: "cz" },
    { country: "Венгрия", gen: "Венгрии", capital: "Будапешт", difficulty: "easy", code: "hu" },
    { country: "Румыния", gen: "Румынии", capital: "Бухарест", difficulty: "easy", code: "ro" },
    { country: "Греция", gen: "Греции", capital: "Афины", difficulty: "easy", code: "gr" },
    { country: "Украина", gen: "Украины", capital: "Киев", difficulty: "easy", code: "ua" },
    { country: "Турция", gen: "Турции", capital: "Анкара", difficulty: "easy", code: "tr" },
    { country: "Исландия", gen: "Исландии", capital: "Рейкьявик", difficulty: "medium", code: "is" },
    { country: "Хорватия", gen: "Хорватии", capital: "Загреб", difficulty: "medium", code: "hr" },
    { country: "Сербия", gen: "Сербии", capital: "Белград", difficulty: "medium", code: "rs" },
    { country: "Болгария", gen: "Болгарии", capital: "София", difficulty: "medium", code: "bg" },
    { country: "Словакия", gen: "Словакии", capital: "Братислава", difficulty: "medium", code: "sk" },
    { country: "Словения", gen: "Словении", capital: "Любляна", difficulty: "medium", code: "si" },
    { country: "Литва", gen: "Литвы", capital: "Вильнюс", difficulty: "medium", code: "lt" },
    { country: "Латвия", gen: "Латвии", capital: "Рига", difficulty: "medium", code: "lv" },
    { country: "Эстония", gen: "Эстонии", capital: "Таллин", difficulty: "medium", code: "ee" },
    { country: "Беларусь", gen: "Беларуси", capital: "Минск", difficulty: "medium", code: "by" },
    { country: "Албания", gen: "Албании", capital: "Тирана", difficulty: "medium", code: "al" },
    { country: "Черногория", gen: "Черногории", capital: "Подгорица", difficulty: "medium", code: "me" },
    { country: "Молдова", gen: "Молдовы", capital: "Кишинёв", difficulty: "medium", code: "md" },
    { country: "Мальта", gen: "Мальты", capital: "Валлетта", difficulty: "hard", code: "mt" },

    // ————— Азия —————

    { country: "Китай", gen: "Китая", capital: "Пекин", difficulty: "easy", code: "cn" },
    { country: "Индия", gen: "Индии", capital: "Нью-Дели", difficulty: "easy", code: "in" },
    { country: "Япония", gen: "Японии", capital: "Токио", difficulty: "easy", code: "jp" },
    { country: "Южная Корея", gen: "Южной Кореи", capital: "Сеул", difficulty: "easy", code: "kr" },
    { country: "Израиль", gen: "Израиля", capital: "Иерусалим", difficulty: "easy", code: "il" },
    { country: "Таиланд", gen: "Таиланда", capital: "Бангкок", difficulty: "easy", code: "th" },
    { country: "Вьетнам", gen: "Вьетнама", capital: "Ханой", difficulty: "easy", code: "vn" },
    { country: "Индонезия", gen: "Индонезии", capital: "Джакарта", difficulty: "easy", code: "id" },
    { country: "Иран", gen: "Ирана", capital: "Тегеран", difficulty: "easy", code: "ir" },
    { country: "Ирак", gen: "Ирака", capital: "Багдад", difficulty: "easy", code: "iq" },
    { country: "Сингапур", gen: "Сингапура", capital: "Сингапур", difficulty: "easy", code: "sg" },
    { country: "Саудовская Аравия", gen: "Саудовской Аравии", capital: "Эр-Рияд", difficulty: "medium", code: "sa" },
    { country: "ОАЭ", gen: "ОАЭ", capital: "Абу-Даби", difficulty: "medium", code: "ae" },
    { country: "Казахстан", gen: "Казахстана", capital: "Астана", difficulty: "medium", code: "kz" },
    { country: "Узбекистан", gen: "Узбекистана", capital: "Ташкент", difficulty: "medium", code: "uz" },
    { country: "Пакистан", gen: "Пакистана", capital: "Исламабад", difficulty: "medium", code: "pk" },
    { country: "Филиппины", gen: "Филиппин", capital: "Манила", difficulty: "medium", code: "ph" },
    { country: "Малайзия", gen: "Малайзии", capital: "Куала-Лумпур", difficulty: "medium", code: "my" },
    { country: "Монголия", gen: "Монголии", capital: "Улан-Батор", difficulty: "medium", code: "mn" },
    { country: "Шри-Ланка", gen: "Шри-Ланки", capital: "Коломбо", difficulty: "medium", code: "lk" },
    { country: "Иордания", gen: "Иордании", capital: "Амман", difficulty: "medium", code: "jo" },
    { country: "Ливан", gen: "Ливана", capital: "Бейрут", difficulty: "medium", code: "lb" },
    { country: "Катар", gen: "Катара", capital: "Доха", difficulty: "medium", code: "qa" },
    { country: "Азербайджан", gen: "Азербайджана", capital: "Баку", difficulty: "medium", code: "az" },
    { country: "Грузия", gen: "Грузии", capital: "Тбилиси", difficulty: "medium", code: "ge" },
    { country: "Армения", gen: "Армении", capital: "Ереван", difficulty: "medium", code: "am" },
    { country: "Сирия", gen: "Сирии", capital: "Дамаск", difficulty: "easy", code: "sy" },
    { country: "Афганистан", gen: "Афганистана", capital: "Кабул", difficulty: "hard", code: "af" },
    { country: "Бангладеш", gen: "Бангладеша", capital: "Дакка", difficulty: "hard", code: "bd" },
    { country: "Бутан", gen: "Бутана", capital: "Тхимпху", difficulty: "hard", code: "bt" },
    { country: "Непал", gen: "Непала", capital: "Катманду", difficulty: "hard", code: "np" },
    { country: "Мальдивы", gen: "Мальдив", capital: "Мале", difficulty: "hard", code: "mv" },
    { country: "Камбоджа", gen: "Камбоджи", capital: "Пномпень", difficulty: "hard", code: "kh" },
    { country: "Лаос", gen: "Лаоса", capital: "Вьентьян", difficulty: "hard", code: "la" },
    { country: "Мьянма", gen: "Мьянмы", capital: "Нейпьидо", difficulty: "hard", code: "mm" },
    { country: "Йемен", gen: "Йемена", capital: "Сана", difficulty: "hard", code: "ye" },
    { country: "Оман", gen: "Омана", capital: "Маскат", difficulty: "hard", code: "om" },
    { country: "Бахрейн", gen: "Бахрейна", capital: "Манама", difficulty: "hard", code: "bh" },
    { country: "Кувейт", gen: "Кувейта", capital: "Эль-Кувейт", difficulty: "hard", code: "kw" },
    { country: "Бруней", gen: "Брунея", capital: "Бандар-Сери-Бегаван", difficulty: "hard", code: "bn" },

    // ————— Африка —————

    { country: "Египет", gen: "Египта", capital: "Каир", difficulty: "easy", code: "eg" },
    { country: "ЮАР", gen: "ЮАР", capital: "Претория", difficulty: "medium", code: "za" },
    { country: "Нигерия", gen: "Нигерии", capital: "Абуджа", difficulty: "medium", code: "ng" },
    { country: "Кения", gen: "Кении", capital: "Найроби", difficulty: "medium", code: "ke" },
    { country: "Марокко", gen: "Марокко", capital: "Рабат", difficulty: "medium", code: "ma" },
    { country: "Алжир", gen: "Алжира", capital: "Алжир", difficulty: "medium", code: "dz" },
    { country: "Эфиопия", gen: "Эфиопии", capital: "Аддис-Абеба", difficulty: "medium", code: "et" },
    { country: "Ливия", gen: "Ливии", capital: "Триполи", difficulty: "medium", code: "ly" },
    { country: "Судан", gen: "Судана", capital: "Хартум", difficulty: "medium", code: "sd" },
    { country: "Сенегал", gen: "Сенегала", capital: "Дакар", difficulty: "medium", code: "sn" },
    { country: "Танзания", gen: "Танзании", capital: "Додома", difficulty: "hard", code: "tz" },
    { country: "Уганда", gen: "Уганды", capital: "Кампала", difficulty: "hard", code: "ug" },
    { country: "Гана", gen: "Ганы", capital: "Аккра", difficulty: "hard", code: "gh" },
    { country: "Камерун", gen: "Камеруна", capital: "Яунде", difficulty: "hard", code: "cm" },
    { country: "Ангола", gen: "Анголы", capital: "Луанда", difficulty: "hard", code: "ao" },
    { country: "Мозамбик", gen: "Мозамбика", capital: "Мапуту", difficulty: "hard", code: "mz" },
    { country: "Замбия", gen: "Замбии", capital: "Лусака", difficulty: "hard", code: "zm" },
    { country: "Зимбабве", gen: "Зимбабве", capital: "Хараре", difficulty: "hard", code: "zw" },
    { country: "Ботсвана", gen: "Ботсваны", capital: "Габороне", difficulty: "hard", code: "bw" },
    { country: "Намибия", gen: "Намибии", capital: "Виндхук", difficulty: "hard", code: "na" },
    { country: "Мали", gen: "Мали", capital: "Бамако", difficulty: "hard", code: "ml" },
    { country: "Чад", gen: "Чада", capital: "Нджамена", difficulty: "hard", code: "td" },

    // ————— Америка —————

    { country: "США", gen: "США", capital: "Вашингтон", difficulty: "easy", code: "us" },
    { country: "Канада", gen: "Канады", capital: "Оттава", difficulty: "easy", code: "ca" },
    { country: "Мексика", gen: "Мексики", capital: "Мехико", difficulty: "easy", code: "mx" },
    { country: "Бразилия", gen: "Бразилии", capital: "Бразилиа", difficulty: "easy", code: "br" },
    { country: "Аргентина", gen: "Аргентины", capital: "Буэнос-Айрес", difficulty: "easy", code: "ar" },
    { country: "Куба", gen: "Кубы", capital: "Гавана", difficulty: "easy", code: "cu" },
    { country: "Чили", gen: "Чили", capital: "Сантьяго", difficulty: "easy", code: "cl" },
    { country: "Перу", gen: "Перу", capital: "Лима", difficulty: "easy", code: "pe" },
    { country: "Колумбия", gen: "Колумбии", capital: "Богота", difficulty: "medium", code: "co" },
    { country: "Венесуэла", gen: "Венесуэлы", capital: "Каракас", difficulty: "medium", code: "ve" },
    { country: "Доминиканская Республика", gen: "Доминиканской Республики", capital: "Санто-Доминго", difficulty: "hard", code: "do" },
    { country: "Коста-Рика", gen: "Коста-Рики", capital: "Сан-Хосе", difficulty: "medium", code: "cr" },
    { country: "Эквадор", gen: "Эквадора", capital: "Кито", difficulty: "medium", code: "ec" },
    { country: "Уругвай", gen: "Уругвая", capital: "Монтевидео", difficulty: "medium", code: "uy" },
    { country: "Парагвай", gen: "Парагвая", capital: "Асунсьон", difficulty: "hard", code: "py" },
    { country: "Боливия", gen: "Боливии", capital: "Сукре", difficulty: "hard", code: "bo" },

    // ————— Океания —————

    { country: "Австралия", gen: "Австралии", capital: "Канберра", difficulty: "easy", code: "au" },
    { country: "Новая Зеландия", gen: "Новой Зеландии", capital: "Веллингтон", difficulty: "easy", code: "nz" },
    { country: "Папуа — Новая Гвинея", gen: "Папуа — Новой Гвинеи", capital: "Порт-Морсби", difficulty: "hard", code: "pg" },
    { country: "Фиджи", gen: "Фиджи", capital: "Сува", difficulty: "hard", code: "fj" },

    // ————— Евразия —————

    { country: "Россия", gen: "России", capital: "Москва", difficulty: "easy", code: "ru" },
    { country: "Кипр", gen: "Кипра", capital: "Никосия", difficulty: "medium", code: "cy" },
  ],
};
