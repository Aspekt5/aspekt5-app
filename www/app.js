
// 🔑 КЛЮЧИ API — оставь свои значения
const GEOCODER_API_KEY = '44617fe1-6370-4ed9-8c72-f7c495544b43';
const GEOSEARCH_API_KEY = '487db5b3-9902-47ee-a5ff-d909a8c7e193';
const DGIS_API_KEY = '11f66c3f-6710-49d0-adcb-59f460b8d51b';

// Соответствие текстов кнопок поисковым фразам
const CATEGORY_QUERIES = {
  'Салоны красоты/косметология': {
    rubrics: [56759, 13726, 13597, 652, 112828, 110816], // SPA, массажист, тонизирующие салоны, косметолог, перманент, эпиляция
    queries: ['салон красоты', 'косметология', 'спа салон', 'массаж']
  },

  'Массажные кабинеты/спа-салоны': {
    rubrics: [56759, 13726], // SPA-процедуры, массажист
    queries: ['массаж', 'массажный кабинет', 'спа салон']
  },

  'Ателье': {
    rubrics: [302], // Швейные ателье
    queries: ['ателье', 'пошив одежды', 'ремонт одежды']
  },

  'Химчистка': {
    rubrics: [313, 1013], // Химчистки, прачечные
    queries: ['химчистка', 'прачечная']
  },

  'Спортивные секции/спортзалы/спортклубы': {
    rubrics: [268, 267, 261, 51256, 20228], // Фитнес-клубы, тренажёрные залы, бассейны, спортивные секции, центры йоги
    queries: ['спортзал', 'фитнес клуб', 'бассейн', 'йога', 'спортивная секция']
  },

  'Барбершопы/парикмахерские': {
    rubrics: [110998], // Барбершопы
    queries: ['барбершоп', 'мужская стрижка', 'парикмахерская']
  },

  'Развлечения для детей': {
    rubrics: [51256], // Спортивные секции (как ближайший маркер активности), при желании позже уточним
    queries: ['детский центр', 'детская игровая', 'развлечения для детей']
  },

  'Автомойка': {
    rubrics: [405], // Автомойки
    queries: ['автомойка']
  },

  'Аптеки': {
    rubrics: [207], // Аптеки
    queries: ['аптека']
  },

  'Медцентры': {
    rubrics: [4521, 201, 224], // Многопрофильные медцентры, больницы, взрослые поликлиники
    queries: ['медицинский центр', 'клиника', 'поликлиника', 'больница']
  },

  'Стоматологические услуги': {
    rubrics: [222, 112852], // Частные стоматологии, частные детские стоматологии
    queries: ['стоматология', 'зубной врач']
  },

  'Церковь': {
    rubrics: [], // отдельной рубрики не вытаскивали — оставляем текстовый поиск
    queries: ['церковь', 'храм', 'собор']
  },

  'Рестораны/кафе': {
    rubrics: [164, 161, 165, 51459, 162, 166], // Рестораны, кафе, фастфуд, пиццерии, кофейни, столовые
    queries: ['ресторан', 'кафе', 'пиццерия', 'суши']
  },

  'Кофейня': {
    rubrics: [162], // Кофейни
    queries: ['кофейня', 'coffee']
  },

  'Кондитерские/пекарни': {
    rubrics: [111594, 363], // Пекарни, кондитерские изделия
    queries: ['кондитерская', 'пекарня', 'выпечка']
  },

  'Уличная еда': {
    rubrics: [165, 16677], // Быстрое питание, кулинарии
    queries: ['фастфуд', 'шаурма', 'бургер', 'уличная еда']
  },

  'Прокат автомобилей': {
    rubrics: [], // отдельного rubric_id мы не вытаскивали — оставляем текст
    queries: ['прокат автомобилей', 'каршеринг']
  },

  'Детские сады/школы': {
    rubrics: [110405, 245, 683], // Частные детсады, школы, гимназии
    queries: ['детский сад', 'школа', 'гимназия', 'лицей']
  },

  'Изготовление ключей': {
    rubrics: [16610], // Изготовление ключей
    queries: ['изготовление ключей', 'ремонт обуви']
  },

  'Магазины': {
    rubrics: [350, 12127, 47633, 389, 380], // Супермаркеты, гипермаркеты, доставка продуктов, цветы, зоотовары
    queries: ['продуктовый магазин', 'супермаркет', 'мини-маркет', 'цветы', 'зоомагазин']
  },

  'Гостиницы': {
    rubrics: [269, 52681], // Гостиницы + хостелы
    queries: ['гостиница', 'отель', 'хостел', 'апарт-отель']
  },

  'Цветочные магазины/флористы': {
    rubrics: [389, 22159], // Цветы, доставка цветов
    queries: ['цветочный магазин', 'цветы', 'флорист']
  },

  'Табак': {
    rubrics: [367, 110483], // Табачные изделия, электронные сигареты
    queries: ['табак', 'вейп', 'сигары']
  }
};


// DOM-элементы
const addressInput = document.getElementById('addressInput');
const searchAddressBtn = document.getElementById('searchAddressBtn');
const addressError = document.getElementById('addressError');
const categoriesSection = document.getElementById('categoriesSection');
const resultsSection = document.getElementById('resultsSection');
const resultsHeader = document.getElementById('resultsHeader');
const resultsList = document.getElementById('resultsList');
const placeDetails = document.getElementById('placeDetails');
const addPlaceBtn = document.getElementById('addPlaceBtn');

let currentAddress = '';
let selectedCategoryName = '';
window.currentCoords = null;
let currentExpandedItem = null;

// ---------- Геокодер: адрес → координаты ----------
async function geocodeAddress(address) {
  const baseUrl = 'https://geocode-maps.yandex.ru/1.x';
  const params = new URLSearchParams  ({
    apikey: GEOCODER_API_KEY,
    geocode: address,
    format: 'json',
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка сети');
    }
    const data = await response.json();

    const collection = data.response.GeoObjectCollection;
    const members = collection.featureMember;
    if (!members || members.length === 0) {
      return null;
    }

    const point = members[0].GeoObject.Point.pos; // строка "долгота широта"
    const [lonStr, latStr] = point.split(' ');
    const lon = parseFloat(lonStr);
    const lat = parseFloat(latStr);

    return { lat, lon };
  } catch (e) {
    console.error('Ошибка геокодера:', e);
    return null;
  }
}

// ---------- Прямоугольная область 500 м вокруг точки ----------
function getBBoxFor500m(lat, lon) {
  // 1 градус широты ≈ 111 км, берём ~0.5 км (500 м)
  const deltaLat = 0.5 / 1110;
  const deltaLon = 0.5 / (1110 * Math.cos(lat * Math.PI / 180));

  const lat1 = lat - deltaLat;
  const lat2 = lat + deltaLat;
  const lon1 = lon - deltaLon;
  const lon2 = lon + deltaLon;

  // формат bbox для Яндекса: "lon1,lat1~lon2,lat2"
  return `${lon1},${lat1}~${lon2},${lat2}`;
}

// ---------- Поиск организаций ----------

// ---------- Категории из локальной базы ----------
// ---------- Форматирование часов работы ----------
function formatWorkHours(hoursStr) {
  if (!hoursStr) return '';
  const days = hoursStr.split('|');
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const times = days.map(d => {
    const parts = d.split(': ');
    return parts.length > 1 ? parts.slice(1).join(': ') : d;
  });
  const groups = [];
  let start = 0;
  for (let i = 1; i <= times.length; i++) {
    if (i === times.length || times[i] !== times[start]) {
      const label = start === i - 1
        ? dayNames[start]
        : dayNames[start] + '–' + dayNames[i - 1];
      groups.push(label + ': ' + times[start]);
      start = i;
    }
  }
  return groups.join('\n');
}

async function searchOrganizations(lat, lon, categoryName) {
  const conf = CATEGORY_QUERIES[categoryName];
  if (!conf) {
    console.warn('Неизвестная категория', categoryName);
    return [];
  }

  const queries = conf.queries || [];
  const rubricIds = conf.rubrics || [];
  const baseUrl = '/api/2gis/3.0/items';
  const allOrgs = [];
  const seenKeys = new Set();

  function parseItem(item) {
    const name = item.name || 'Без названия';
    const addr = item.address_name || '';
    const key = name + '|' + addr;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    let orgLat = null, orgLon = null;
    if (item.point) {
      if (typeof item.point === 'string') {
        const parts = item.point.split(',');
        orgLon = parseFloat(parts[0]);
        orgLat = parseFloat(parts[1]);
      } else {
        orgLat = item.point.lat;
        orgLon = item.point.lon;
      }
    }

    let phones = [];
    if (item.contact_groups) {
      item.contact_groups.forEach(g => {
        (g.contacts || []).forEach(c => {
          if (c.type === 'phone' && c.value) phones.push(c.value);
        });
      });
    }

    let hours = null;
    if (item.schedule) hours = item.schedule;

    allOrgs.push({ name, address: addr, lat: orgLat, lon: orgLon, phones, hours, distance: null });
  }

  async function fetchPages(params) {
    let page = 1;
    while (page <= 5) {
      try {
        params.set('page', String(page));
        const url = baseUrl + '?' + params.toString();
        const response = await fetch(url);
        if (!response.ok) break;
        const data = await response.json();
        const items = (data.result && data.result.items) || [];
        if (items.length === 0) break;
        items.forEach(parseItem);
        if (items.length < 50) break;
        page++;
      } catch (e) {
        console.error('2GIS fetch error', e);
        break;
      }
    }
  }

  // 1) Поиск по rubric_id
  for (const rid of rubricIds) {
    const params = new URLSearchParams({
      rubric_id: String(rid),
      point: lon + ',' + lat,
      radius: '1500',
      sort: 'distance',
      type: 'branch',
      fields: 'items.point,items.schedule,items.contact_groups,items.address_name',
      page_size: '50',
      key: DGIS_API_KEY
    });
    await fetchPages(params);
  }

  // 2) Fallback на текстовый q (если rubric_id не дал результатов)
  if (allOrgs.length === 0 && queries.length > 0) {
    for (const query of queries) {
      const params = new URLSearchParams({
        q: query,
        point: lon + ',' + lat,
        radius: '1500',
        sort: 'distance',
        type: 'branch',
        fields: 'items.point,items.schedule,items.contact_groups,items.address_name',
        page_size: '50',
        key: DGIS_API_KEY
      });
      await fetchPages(params);
    }
  }

  if (allOrgs.length === 0) {
    addressError.textContent = 'Не удалось загрузить список мест. Проверьте интернет и попробуйте ещё раз.';
  }

  return allOrgs;
}

// ---------- Расстояние между точками (м) ----------
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ---------- Обработчик кнопки "Найти" ----------
searchAddressBtn.addEventListener('click', async () => {
    const value = addressInput.value.trim();

    if (!value) {
        addressError.textContent = 'Введите адрес, например: «Москва, Тверская 10».';
        return;
    }

    addressError.textContent = 'Идёт поиск адреса…';

    const coords = await geocodeAddress(value);

    if (!coords) {
        addressError.textContent = 'Адрес не найден. Проверьте написание или уточните дом/корпус.';
        categoriesSection.hidden = true;
        resultsSection.hidden = true;
        addPlaceBtn.hidden = true;
        return;
    }

    addressError.textContent = '';
    currentAddress = value;
    window.currentCoords = coords;

    categoriesSection.hidden = false;
    resultsSection.hidden = true;
    addPlaceBtn.hidden = true;
});

// ---------- Обработчик выбора категории ----------

// ---------- Обработчик кнопок радиуса ----------
let currentRadius = 500;
window.currentRadius = currentRadius;
document.querySelectorAll('.radius-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRadius = parseInt(btn.dataset.radius || btn.textContent);
    window.currentRadius = currentRadius;
    if (selectedCategoryName) showResults();
  });
});
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentAddress || !window.currentCoords) {
      addressError.textContent = 'Сначала введите адрес и нажмите "Найти"';
      return;
    }
    addressError.textContent = '';
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    selectedCategoryName = btn.textContent;

    showResults();
  });
});

// ---------- Показ результатов ----------
async function showResults() {
  if (!window.currentCoords) {
    addressError.textContent = 'Сначала введите адрес и нажмите "Найти"';
    return;
  }

  const { lat, lon } = window.currentCoords;

  resultsSection.hidden = false;
  addPlaceBtn.hidden = false;
  resultsHeader.textContent = `Поиск... (${selectedCategoryName})`;
  resultsList.innerHTML = '';
  placeDetails.innerHTML = '';
// Показать спиннер загрузки
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-overlay';
  const spinnerEl = document.createElement('div');
  spinnerEl.className = 'spinner';
  const loadingText = document.createElement('span');
  loadingText.textContent = 'Ищем заведения поблизости...';
  loadingDiv.appendChild(spinnerEl);
  loadingDiv.appendChild(loadingText);
  resultsList.appendChild(loadingDiv);


  let orgs = [];
  try {
    orgs = await searchOrganizations(lat, lon, selectedCategoryName) || [];
  } catch (err) {
    console.error("searchOrganizations error:", err);
    alert("Ошибка поиска: " + err.message);
  }
  resultsList.innerHTML = "";
  placeDetails.innerHTML = "";


  if (!orgs || orgs.length === 0) {
    resultsHeader.textContent = `Найдено: 0 мест (${selectedCategoryName})`;

    const emptyDiv = document.createElement('div');
    emptyDiv.textContent = 'В радиусе 500 м ничего не найдено. Попробуйте другую категорию или другой адрес.'
    emptyDiv.style.marginBottom = '8px';
    resultsList.appendChild(emptyDiv);

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Добавить заведение';
    addBtn.className = 'primary-btn';
    addBtn.addEventListener('click', () => {
      alert('Форма "Добавить заведение" будет на следующем этапе');
    });

    placeDetails.appendChild(addBtn);
    return;
  }
  orgs.forEach(o => {
      if (o.lat && o.lon) {

      o.distance = distanceMeters(lat, lon, o.lat, o.lon);
      console.log(o.name, "| расстояние:", Math.round(o.distance), "м");
    } else {
      o.distance = null;
    }
  });
  orgs.sort((a, b) => {
    if (a.distance == null) return 1;
    if (b.distance == null) return -1;
    return a.distance - b.distance;
  });
    // показываем только те, что в радиусе 500 м
    const filteredOrgs = orgs.filter(o => typeof o.distance === 'number' && o.distance <= currentRadius);


    resultsHeader.textContent = `Найдено: ${filteredOrgs.length} мест (${selectedCategoryName})`;
    resultsList.innerHTML = '';
    placeDetails.innerHTML = '';

      filteredOrgs.forEach((o, index) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    const distText = o.distance != null ? Math.round(o.distance) + ' м' : '';
    item.innerHTML = (o.name || 'Без названия') + (distText ? ' <span style="color:#e57373;">' + distText + '</span>' : '');


  item.addEventListener('click', () => {
    // если уже раскрыт именно этот item — свернуть
    if (currentExpandedItem && currentExpandedItem.item === item) {
      if (currentExpandedItem.details && currentExpandedItem.details.parentNode) {
        currentExpandedItem.details.parentNode.removeChild(currentExpandedItem.details);
      }
      item.classList.remove('selected');
      currentExpandedItem = null;
      return;
    }

    // закрыть предыдущий раскрытый, если есть
    if (currentExpandedItem) {
      if (currentExpandedItem.details && currentExpandedItem.details.parentNode) {
        currentExpandedItem.details.parentNode.removeChild(currentExpandedItem.details);
      }
      if (currentExpandedItem.item) {
        currentExpandedItem.item.classList.remove('selected');
      }
    }

    // отметить текущий
    document.querySelectorAll('.result-item').forEach(el => el.classList.remove('selected'));
    item.classList.add('selected');

    // создать и вставить карточку сразу под строкой
    const detailsEl = createPlaceDetailsElement(o);
    item.insertAdjacentElement('afterend', detailsEl);

    currentExpandedItem = { item, details: detailsEl };
  });

  resultsList.appendChild(item);

  // по умолчанию ничего не раскрываем автоматически
  });
}

// ---------- Показ карточки заведения ----------
function createPlaceDetailsElement(place) {
  const container = document.createElement('div');
  container.className = 'place-details-inline';

  const nameRow = document.createElement('div');
  nameRow.className = 'place-details-row';
  nameRow.style.fontWeight = '600';
  nameRow.textContent = place.name || '';
  container.appendChild(nameRow);

  if (place.address) {
    const addrRow = document.createElement('div');
    addrRow.className = 'place-details-row';
    addrRow.textContent = place.address;
    container.appendChild(addrRow);
  }

  if (typeof place.distance === 'number') {
    const distRow = document.createElement('div');
    distRow.className = 'place-details-row';
    distRow.textContent = `${place.distance} м от вас`;
    container.appendChild(distRow);
  }

  if (place.phones && place.phones.length > 0) {
  place.phones.forEach(function(ph) {
    const val = (typeof ph === 'string') ? ph : (ph.formatted || ph.value);
    const phoneRow = document.createElement('div');
    phoneRow.className = 'place-details-row';
    const link = document.createElement('a');
    link.href = 'tel:' + val.replace(/[^+\d]/g, '');
    link.textContent = '📞 ' + val;
    link.style.color = '#1a73e8';
    phoneRow.appendChild(link);
    container.appendChild(phoneRow);
  });
}

    if (place.hours) {
    const hoursRow = document.createElement('div');
    hoursRow.className = 'place-details-row';
    if (typeof place.hours === 'string') {
      hoursRow.style.whiteSpace = 'pre-line';
      hoursRow.textContent = formatWorkHours(place.hours);
    } else if (place.hours.text) {
      hoursRow.textContent = place.hours.text;
    } else {
      const days = {Mon:'Пн',Tue:'Вт',Wed:'Ср',Thu:'Чт',Fri:'Пт',Sat:'Сб',Sun:'Вс'};
      const parts = [];
      for (const [eng, rus] of Object.entries(days)) {
        if (place.hours[eng] && place.hours[eng].working_hours) {
          const wh = place.hours[eng].working_hours[0];
          parts.push(rus + ' ' + wh.from + '–' + wh.to);
        }
      }
      hoursRow.textContent = parts.join(', ');
    }
    if (hoursRow.textContent) container.appendChild(hoursRow);
  }

  const mapBtn = document.createElement('button');
  mapBtn.className = 'show-on-map-btn';
  mapBtn.textContent = 'Показать маршрут на карте';
  mapBtn.addEventListener('click', () => {
    const url = `https://yandex.ru/maps/?rtext=${window.currentCoords.lat},${window.currentCoords.lon}~${place.lat},${place.lon}&rtt=pd`;
    window.open(url, '_blank');
  });
  container.appendChild(mapBtn);

  return container;
}
// ---------- Автоподсказки адреса (SuggestView) ----------
if (window.ymaps) {
  ymaps.ready(() => {
    // Привязываем подсказки к полю ввода адреса
    new ymaps.SuggestView('addressInput', {
      results: 5  // до 5 вариантов подсказок
    });
  });
}
