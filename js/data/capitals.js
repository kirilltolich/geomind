/* GeoMind — база стран и столиц (118 записей).
 * Каждая запись:
 *   country     — страна (именительный падеж)
 *   gen         — родительный падеж (для «Какая столица у …?»)
 *   capital     — столица
 *   flag        — эмодзи-флаг страны
 *   flagImg     — URL изображения флага (flag-gimn.ru)
 *   difficulty  — сложность: "easy" | "medium" | "hard"
 * Параметр сложности пока не используется в интерфейсе, но подготовлен
 * для будущей адаптивной сложности и выбора уровня тренировки.
 */
window.GeoMind = window.GeoMind || {};

window.GeoMind.Data = {
  CAPITALS: [

    // ————— Европа —————

    { country: "Франция", gen: "Франции", capital: "Париж", flag: "🇫🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A4%D1%80%D0%B0%D0%BD%D1%86%D0%B8%D1%8F.png" },
    { country: "Германия", gen: "Германии", capital: "Берлин", flag: "🇩🇪", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%93%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Италия", gen: "Италии", capital: "Рим", flag: "🇮🇹", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%82%D0%B0%D0%BB%D0%B8%D1%8F.png" },
    { country: "Испания", gen: "Испании", capital: "Мадрид", flag: "🇪🇸", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%81%D0%BF%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Великобритания", gen: "Великобритании", capital: "Лондон", flag: "🇬🇧", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/United_Kingdom.png" },
    { country: "Португалия", gen: "Португалии", capital: "Лиссабон", flag: "🇵🇹", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%BE%D1%80%D1%82%D1%83%D0%B3%D0%B0%D0%BB%D0%B8%D1%8F.png" },
    { country: "Нидерланды", gen: "Нидерландов", capital: "Амстердам", flag: "🇳🇱", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%B8%D0%B4%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B4%D1%8B.png" },
    { country: "Бельгия", gen: "Бельгии", capital: "Брюссель", flag: "🇧🇪", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%B5%D0%BB%D1%8C%D0%B3%D0%B8%D1%8F.png" },
    { country: "Швейцария", gen: "Швейцарии", capital: "Берн", flag: "🇨🇭", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A8%D0%B2%D0%B5%D0%B9%D1%86%D0%B0%D1%80%D0%B8%D1%8F.png" },
    { country: "Австрия", gen: "Австрии", capital: "Вена", flag: "🇦🇹", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%B2%D1%81%D1%82%D1%80%D0%B8%D1%8F.png" },
    { country: "Швеция", gen: "Швеции", capital: "Стокгольм", flag: "🇸🇪", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A8%D0%B2%D0%B5%D1%86%D0%B8%D1%8F.png" },
    { country: "Норвегия", gen: "Норвегии", capital: "Осло", flag: "🇳🇴", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%BE%D1%80%D0%B2%D0%B5%D0%B3%D0%B8%D1%8F.png" },
    { country: "Дания", gen: "Дании", capital: "Копенгаген", flag: "🇩🇰", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%94%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Финляндия", gen: "Финляндии", capital: "Хельсинки", flag: "🇫🇮", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A4%D0%B8%D0%BD%D0%BB%D1%8F%D0%BD%D0%B4%D0%B8%D1%8F.png" },
    { country: "Ирландия", gen: "Ирландии", capital: "Дублин", flag: "🇮🇪", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%80%D0%BB%D0%B0%D0%BD%D0%B4%D0%B8%D1%8F.png" },
    { country: "Польша", gen: "Польши", capital: "Варшава", flag: "🇵🇱", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%BE%D0%BB%D1%8C%D1%88%D0%B0.png" },
    { country: "Чехия", gen: "Чехии", capital: "Прага", flag: "🇨🇿", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A7%D0%B5%D1%85%D0%B8%D1%8F.png" },
    { country: "Венгрия", gen: "Венгрии", capital: "Будапешт", flag: "🇭🇺", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%92%D0%B5%D0%BD%D0%B3%D1%80%D0%B8%D1%8F.png" },
    { country: "Румыния", gen: "Румынии", capital: "Бухарест", flag: "🇷🇴", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A0%D1%83%D0%BC%D1%8B%D0%BD%D0%B8%D1%8F.png" },
    { country: "Греция", gen: "Греции", capital: "Афины", flag: "🇬🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%93%D1%80%D0%B5%D1%86%D0%B8%D1%8F.png" },
    { country: "Украина", gen: "Украины", capital: "Киев", flag: "🇺🇦", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A3%D0%BA%D1%80%D0%B0%D0%B8%D0%BD%D0%B0.png" },
    { country: "Турция", gen: "Турции", capital: "Анкара", flag: "🇹🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A2%D1%83%D1%80%D1%86%D0%B8%D1%8F.png" },
    { country: "Исландия", gen: "Исландии", capital: "Рейкьявик", flag: "🇮🇸", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%81%D0%BB%D0%B0%D0%BD%D0%B4%D0%B8%D1%8F.png" },
    { country: "Хорватия", gen: "Хорватии", capital: "Загреб", flag: "🇭🇷", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A5%D0%BE%D1%80%D0%B2%D0%B0%D1%82%D0%B8%D1%8F.png" },
    { country: "Сербия", gen: "Сербии", capital: "Белград", flag: "🇷🇸", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%B5%D1%80%D0%B1%D0%B8%D1%8F.png" },
    { country: "Болгария", gen: "Болгарии", capital: "София", flag: "🇧🇬", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%BE%D0%BB%D0%B3%D0%B0%D1%80%D0%B8%D1%8F.png" },
    { country: "Словакия", gen: "Словакии", capital: "Братислава", flag: "🇸🇰", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%BB%D0%BE%D0%B2%D0%B0%D0%BA%D0%B8%D1%8F.png" },
    { country: "Словения", gen: "Словении", capital: "Любляна", flag: "🇸🇮", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%BB%D0%BE%D0%B2%D0%B5%D0%BD%D0%B8%D1%8F.png" },
    { country: "Литва", gen: "Литвы", capital: "Вильнюс", flag: "🇱🇹", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9B%D0%B8%D1%82%D0%B2%D0%B0.png" },
    { country: "Латвия", gen: "Латвии", capital: "Рига", flag: "🇱🇻", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9B%D0%B0%D1%82%D0%B2%D0%B8%D1%8F.png" },
    { country: "Эстония", gen: "Эстонии", capital: "Таллин", flag: "🇪🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%AD%D1%81%D1%82%D0%BE%D0%BD%D0%B8%D1%8F.png" },
    { country: "Беларусь", gen: "Беларуси", capital: "Минск", flag: "🇧🇾", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%B5%D0%BB%D0%B0%D1%80%D1%83%D1%81%D1%8C.png" },
    { country: "Албания", gen: "Албании", capital: "Тирана", flag: "🇦🇱", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%BB%D0%B1%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Черногория", gen: "Черногории", capital: "Подгорица", flag: "🇲🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A7%D0%B5%D1%80%D0%BD%D0%BE%D0%B3%D0%BE%D1%80%D0%B8%D1%8F.png" },
    { country: "Молдова", gen: "Молдовы", capital: "Кишинёв", flag: "🇲🇩", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%BE%D0%BB%D0%B4%D0%BE%D0%B2%D0%B0.png" },
    { country: "Мальта", gen: "Мальты", capital: "Валлетта", flag: "🇲🇹", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B0%D0%BB%D1%8C%D1%82%D0%B0.png" },

    // ————— Азия —————

    { country: "Китай", gen: "Китая", capital: "Пекин", flag: "🇨🇳", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B8%D1%82%D0%B0%D0%B9.png" },
    { country: "Индия", gen: "Индии", capital: "Нью-Дели", flag: "🇮🇳", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D0%BD%D0%B4%D0%B8%D1%8F.png" },
    { country: "Япония", gen: "Японии", capital: "Токио", flag: "🇯🇵", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%AF%D0%BF%D0%BE%D0%BD%D0%B8%D1%8F.png" },
    { country: "Южная Корея", gen: "Южной Кореи", capital: "Сеул", flag: "🇰🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%AE%D0%B6%D0%BD%D0%B0%D1%8F%20%D0%9A%D0%BE%D1%80%D0%B5%D1%8F.png" },
    { country: "Израиль", gen: "Израиля", capital: "Иерусалим", flag: "🇮🇱", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D0%B7%D1%80%D0%B0%D0%B8%D0%BB%D1%8C.png" },
    { country: "Таиланд", gen: "Таиланда", capital: "Бангкок", flag: "🇹🇭", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A2%D0%B0%D0%B8%D0%BB%D0%B0%D0%BD%D0%B4.png" },
    { country: "Вьетнам", gen: "Вьетнама", capital: "Ханой", flag: "🇻🇳", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%92%D1%8C%D0%B5%D1%82%D0%BD%D0%B0%D0%BC.png" },
    { country: "Индонезия", gen: "Индонезии", capital: "Джакарта", flag: "🇮🇩", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D0%BD%D0%B4%D0%BE%D0%BD%D0%B5%D0%B7%D0%B8%D1%8F.png" },
    { country: "Иран", gen: "Ирана", capital: "Тегеран", flag: "🇮🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%80%D0%B0%D0%BD.png" },
    { country: "Ирак", gen: "Ирака", capital: "Багдад", flag: "🇮🇶", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%98%D1%80%D0%B0%D0%BA.png" },
    { country: "Сингапур", gen: "Сингапура", capital: "Сингапур", flag: "🇸🇬", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%B8%D0%BD%D0%B3%D0%B0%D0%BF%D1%83%D1%80.png" },
    { country: "Саудовская Аравия", gen: "Саудовской Аравии", capital: "Эр-Рияд", flag: "🇸🇦", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%B0%D1%83%D0%B4%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20%D0%90%D1%80%D0%B0%D0%B2%D0%B8%D1%8F.png" },
    { country: "ОАЭ", gen: "ОАЭ", capital: "Абу-Даби", flag: "🇦🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/United_Arab_Emirates.png" },
    { country: "Казахстан", gen: "Казахстана", capital: "Астана", flag: "🇰🇿", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD.png" },
    { country: "Узбекистан", gen: "Узбекистана", capital: "Ташкент", flag: "🇺🇿", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A3%D0%B7%D0%B1%D0%B5%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD.png" },
    { country: "Пакистан", gen: "Пакистана", capital: "Исламабад", flag: "🇵🇰", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%B0%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD.png" },
    { country: "Филиппины", gen: "Филиппин", capital: "Манила", flag: "🇵🇭", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A4%D0%B8%D0%BB%D0%B8%D0%BF%D0%BF%D0%B8%D0%BD%D1%8B.png" },
    { country: "Малайзия", gen: "Малайзии", capital: "Куала-Лумпур", flag: "🇲🇾", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B0%D0%BB%D0%B0%D0%B9%D0%B7%D0%B8%D1%8F.png" },
    { country: "Монголия", gen: "Монголии", capital: "Улан-Батор", flag: "🇲🇳", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D0%B8%D1%8F.png" },
    { country: "Шри-Ланка", gen: "Шри-Ланки", capital: "Коломбо", flag: "🇱🇰", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A8%D1%80%D0%B8-%D0%9B%D0%B0%D0%BD%D0%BA%D0%B0.png" },
    { country: "Иордания", gen: "Иордании", capital: "Амман", flag: "🇯🇴", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%98%D0%BE%D1%80%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Ливан", gen: "Ливана", capital: "Бейрут", flag: "🇱🇧", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9B%D0%B8%D0%B2%D0%B0%D0%BD.png" },
    { country: "Катар", gen: "Катара", capital: "Доха", flag: "🇶🇦", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B0%D1%82%D0%B0%D1%80.png" },
    { country: "Азербайджан", gen: "Азербайджана", capital: "Баку", flag: "🇦🇿", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%B7%D0%B5%D1%80%D0%B1%D0%B0%D0%B9%D0%B4%D0%B6%D0%B0%D0%BD.png" },
    { country: "Грузия", gen: "Грузии", capital: "Тбилиси", flag: "🇬🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%93%D1%80%D1%83%D0%B7%D0%B8%D1%8F.png" },
    { country: "Армения", gen: "Армении", capital: "Ереван", flag: "🇦🇲", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%90%D1%80%D0%BC%D0%B5%D0%BD%D0%B8%D1%8F.png" },
    { country: "Сирия", gen: "Сирии", capital: "Дамаск", flag: "🇸🇾", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%B8%D1%80%D0%B8%D1%8F.png" },
    { country: "Афганистан", gen: "Афганистана", capital: "Кабул", flag: "🇦🇫", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%90%D1%84%D0%B3%D0%B0%D0%BD%D0%B8%D1%81%D1%82%D0%B0%D0%BD.png" },
    { country: "Бангладеш", gen: "Бангладеша", capital: "Дакка", flag: "🇧🇩", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%B0%D0%BD%D0%B3%D0%BB%D0%B0%D0%B4%D0%B5%D1%88.png" },
    { country: "Бутан", gen: "Бутана", capital: "Тхимпху", flag: "🇧🇹", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D1%83%D1%82%D0%B0%D0%BD.png" },
    { country: "Непал", gen: "Непала", capital: "Катманду", flag: "🇳🇵", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%B5%D0%BF%D0%B0%D0%BB.png" },
    { country: "Мальдивы", gen: "Мальдив", capital: "Мале", flag: "🇲🇻", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B0%D0%BB%D1%8C%D0%B4%D0%B8%D0%B2%D1%8B.png" },
    { country: "Камбоджа", gen: "Камбоджи", capital: "Пномпень", flag: "🇰🇭", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B0%D0%BC%D0%B1%D0%BE%D0%B4%D0%B6%D0%B0.png" },
    { country: "Лаос", gen: "Лаоса", capital: "Вьентьян", flag: "🇱🇦", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9B%D0%B0%D0%BE%D1%81.png" },
    { country: "Мьянма", gen: "Мьянмы", capital: "Нейпьидо", flag: "🇲🇲", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D1%8C%D1%8F%D0%BD%D0%BC%D0%B0.png" },
    { country: "Йемен", gen: "Йемена", capital: "Сана", flag: "🇾🇪", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%99%D0%B5%D0%BC%D0%B5%D0%BD.png" },
    { country: "Оман", gen: "Омана", capital: "Маскат", flag: "🇴🇲", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9E%D0%BC%D0%B0%D0%BD.png" },
    { country: "Бахрейн", gen: "Бахрейна", capital: "Манама", flag: "🇧🇭", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%B0%D1%85%D1%80%D0%B5%D0%B9%D0%BD.png" },
    { country: "Кувейт", gen: "Кувейта", capital: "Эль-Кувейт", flag: "🇰🇼", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D1%83%D0%B2%D0%B5%D0%B9%D1%82.png" },
    { country: "Бруней", gen: "Брунея", capital: "Бандар-Сери-Бегаван", flag: "🇧🇳", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D1%80%D1%83%D0%BD%D0%B5%D0%B9.png" },

    // ————— Африка —————

    { country: "Египет", gen: "Египта", capital: "Каир", flag: "🇪🇬", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%95%D0%B3%D0%B8%D0%BF%D0%B5%D1%82.png" },
    { country: "ЮАР", gen: "ЮАР", capital: "Претория", flag: "🇿🇦", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%AE%D0%90%D0%A0.png" },
    { country: "Нигерия", gen: "Нигерии", capital: "Абуджа", flag: "🇳🇬", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%B8%D0%B3%D0%B5%D1%80%D0%B8%D1%8F.png" },
    { country: "Кения", gen: "Кении", capital: "Найроби", flag: "🇰🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B5%D0%BD%D0%B8%D1%8F.png" },
    { country: "Марокко", gen: "Марокко", capital: "Рабат", flag: "🇲🇦", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B0%D1%80%D0%BE%D0%BA%D0%BA%D0%BE.png" },
    { country: "Алжир", gen: "Алжира", capital: "Алжир", flag: "🇩🇿", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%BB%D0%B6%D0%B8%D1%80.png" },
    { country: "Эфиопия", gen: "Эфиопии", capital: "Аддис-Абеба", flag: "🇪🇹", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%AD%D1%84%D0%B8%D0%BE%D0%BF%D0%B8%D1%8F.png" },
    { country: "Ливия", gen: "Ливии", capital: "Триполи", flag: "🇱🇾", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9B%D0%B8%D0%B2%D0%B8%D1%8F.png" },
    { country: "Судан", gen: "Судана", capital: "Хартум", flag: "🇸🇩", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D1%83%D0%B4%D0%B0%D0%BD.png" },
    { country: "Сенегал", gen: "Сенегала", capital: "Дакар", flag: "🇸🇳", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%A1%D0%B5%D0%BD%D0%B5%D0%B3%D0%B0%D0%BB.png" },
    { country: "Танзания", gen: "Танзании", capital: "Додома", flag: "🇹🇿", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%A2%D0%B0%D0%BD%D0%B7%D0%B0%D0%BD%D0%B8%D1%8F.png" },
    { country: "Уганда", gen: "Уганды", capital: "Кампала", flag: "🇺🇬", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%A3%D0%B3%D0%B0%D0%BD%D0%B4%D0%B0.png" },
    { country: "Гана", gen: "Ганы", capital: "Аккра", flag: "🇬🇭", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%93%D0%B0%D0%BD%D0%B0.png" },
    { country: "Камерун", gen: "Камеруна", capital: "Яунде", flag: "🇨🇲", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B0%D0%BC%D0%B5%D1%80%D1%83%D0%BD.png" },
    { country: "Ангола", gen: "Анголы", capital: "Луанда", flag: "🇦🇴", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%BD%D0%B3%D0%BE%D0%BB%D0%B0.png" },
    { country: "Мозамбик", gen: "Мозамбика", capital: "Мапуту", flag: "🇲🇿", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%BE%D0%B7%D0%B0%D0%BC%D0%B1%D0%B8%D0%BA.png" },
    { country: "Замбия", gen: "Замбии", capital: "Лусака", flag: "🇿🇲", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%97%D0%B0%D0%BC%D0%B1%D0%B8%D1%8F.png" },
    { country: "Зимбабве", gen: "Зимбабве", capital: "Хараре", flag: "🇿🇼", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%97%D0%B8%D0%BC%D0%B1%D0%B0%D0%B1%D0%B2%D0%B5.png" },
    { country: "Ботсвана", gen: "Ботсваны", capital: "Габороне", flag: "🇧🇼", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%BE%D1%82%D1%81%D0%B2%D0%B0%D0%BD%D0%B0.png" },
    { country: "Намибия", gen: "Намибии", capital: "Виндхук", flag: "🇳🇦", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%B0%D0%BC%D0%B8%D0%B1%D0%B8%D1%8F.png" },
    { country: "Мали", gen: "Мали", capital: "Бамако", flag: "🇲🇱", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B0%D0%BB%D0%B8.png" },
    { country: "Чад", gen: "Чада", capital: "Нджамена", flag: "🇹🇩", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%A7%D0%B0%D0%B4.png" },

    // ————— Америка —————

    { country: "США", gen: "США", capital: "Вашингтон", flag: "🇺🇸", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/United_States.png" },
    { country: "Канада", gen: "Канады", capital: "Оттава", flag: "🇨🇦", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B0%D0%BD%D0%B0%D0%B4%D0%B0.png" },
    { country: "Мексика", gen: "Мексики", capital: "Мехико", flag: "🇲🇽", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9C%D0%B5%D0%BA%D1%81%D0%B8%D0%BA%D0%B0.png" },
    { country: "Бразилия", gen: "Бразилии", capital: "Бразилиа", flag: "🇧🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%91%D1%80%D0%B0%D0%B7%D0%B8%D0%BB%D0%B8%D1%8F.png" },
    { country: "Аргентина", gen: "Аргентины", capital: "Буэнос-Айрес", flag: "🇦🇷", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%90%D1%80%D0%B3%D0%B5%D0%BD%D1%82%D0%B8%D0%BD%D0%B0.png" },
    { country: "Куба", gen: "Кубы", capital: "Гавана", flag: "🇨🇺", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D1%83%D0%B1%D0%B0.png" },
    { country: "Чили", gen: "Чили", capital: "Сантьяго", flag: "🇨🇱", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A7%D0%B8%D0%BB%D0%B8.png" },
    { country: "Перу", gen: "Перу", capital: "Лима", flag: "🇵🇪", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%B5%D1%80%D1%83.png" },
    { country: "Колумбия", gen: "Колумбии", capital: "Богота", flag: "🇨🇴", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%BE%D0%BB%D1%83%D0%BC%D0%B1%D0%B8%D1%8F.png" },
    { country: "Венесуэла", gen: "Венесуэлы", capital: "Каракас", flag: "🇻🇪", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%92%D0%B5%D0%BD%D0%B5%D1%81%D1%83%D1%8D%D0%BB%D0%B0.png" },
    { country: "Доминиканская Республика", gen: "Доминиканской Республики", capital: "Санто-Доминго", flag: "🇩🇴", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%94%D0%BE%D0%BC%D0%B8%D0%BD%D0%B8%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%A0%D0%B5%D1%81%D0%BF%D1%83%D0%B1%D0%BB%D0%B8%D0%BA%D0%B0.png" },
    { country: "Коста-Рика", gen: "Коста-Рики", capital: "Сан-Хосе", flag: "🇨🇷", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%BE%D1%81%D1%82%D0%B0-%D0%A0%D0%B8%D0%BA%D0%B0.png" },
    { country: "Эквадор", gen: "Эквадора", capital: "Кито", flag: "🇪🇨", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%AD%D0%BA%D0%B2%D0%B0%D0%B4%D0%BE%D1%80.png" },
    { country: "Уругвай", gen: "Уругвая", capital: "Монтевидео", flag: "🇺🇾", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/Uruguay.png" },
    { country: "Парагвай", gen: "Парагвая", capital: "Асунсьон", flag: "🇵🇾", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%B0%D1%80%D0%B0%D0%B3%D0%B2%D0%B0%D0%B9.png" },
    { country: "Боливия", gen: "Боливии", capital: "Сукре", flag: "🇧🇴", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%91%D0%BE%D0%BB%D0%B8%D0%B2%D0%B8%D1%8F.png" },

    // ————— Океания —————

    { country: "Австралия", gen: "Австралии", capital: "Канберра", flag: "🇦🇺", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%90%D0%B2%D1%81%D1%82%D1%80%D0%B0%D0%BB%D0%B8%D1%8F.png" },
    { country: "Новая Зеландия", gen: "Новой Зеландии", capital: "Веллингтон", flag: "🇳🇿", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%9D%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%97%D0%B5%D0%BB%D0%B0%D0%BD%D0%B4%D0%B8%D1%8F.png" },
    { country: "Папуа — Новая Гвинея", gen: "Папуа — Новой Гвинеи", capital: "Порт-Морсби", flag: "🇵🇬", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%9F%D0%B0%D0%BF%D1%83%D0%B0%20%E2%80%94%20%D0%9D%D0%BE%D0%B2%D0%B0%D1%8F%20%D0%93%D0%B2%D0%B8%D0%BD%D0%B5%D1%8F.png" },
    { country: "Фиджи", gen: "Фиджи", capital: "Сува", flag: "🇫🇯", difficulty: "hard", flagImg: "https://flag-gimn.ru/flags/%D0%A4%D0%B8%D0%B4%D0%B6%D0%B8.png" },

    // ————— Евразия —————

    { country: "Россия", gen: "России", capital: "Москва", flag: "🇷🇺", difficulty: "easy", flagImg: "https://flag-gimn.ru/flags/%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F.png" },
    { country: "Кипр", gen: "Кипра", capital: "Никосия", flag: "🇨🇾", difficulty: "medium", flagImg: "https://flag-gimn.ru/flags/%D0%9A%D0%B8%D0%BF%D1%80.png" },
  ],
};
