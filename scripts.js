async function loadContests(){
  const res = await fetch('data/contests.json');
  const contests = await res.json();

  function parseDate(str){
    // str = "DD-MM-YYYY"
    const [day, month, year] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return contests.sort((a,b)=>parseDate(a.date) - parseDate(b.date));
}

async function loadArchive(){
  const res = await fetch('data/archive.json');
  const contests = await res.json();

  function parseDate(str){
    const [day, month, year] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return contests.sort((a,b)=>parseDate(b.date) - parseDate(a.date)); // от новых к старым
}

function cardHTML(c){
  return `<div class="card">
    <h3>${c.title}</h3>
    <div class="kv">
      <span class="badge">📅 ${c.date}</span>
      <span class="badge">📍 ${c.place}</span>
    </div>
    <p>${c.excerpt||''}</p>
    <a class="btn" href="contest.html?slug=${encodeURIComponent(c.slug)}">Подробнее</a>
  </div>`;
}

function archiveCardHTML(c){
  return `<div class="card">
    <h3>${c.title}</h3>
    <div class="kv">
      <span class="badge">📅 ${c.date}</span>
      <span class="badge">📍 ${c.place}</span>
    </div>
    <p>${c.excerpt||''}</p>
    <a class="btn" href="${c.docs?.results||'#'}" target="_blank">🏆 Смотреть результаты</a>
  </div>`;
}

function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

(async ()=>{
  const contests = await loadContests();

  // Главная — список ближайших (только 3 первых)
  const up = document.getElementById('upcoming-list');
  if(up){
      // Берем только первые 3 конкурса
      const upcomingContests = contests.slice(0, 3);
      up.innerHTML = upcomingContests.map(cardHTML).join('');
  }

  // Каталог — все конкурсы
  const catalog = document.getElementById('catalog-list');
  if(catalog){
    catalog.innerHTML = contests.map(cardHTML).join('');
  }

  // Страница конкурса
  const slug = getParam('slug');
  const page = document.getElementById('contest-page');
  if(slug && page){
    const c = contests.find(x=>x.slug===slug);
    if(!c){ page.innerHTML = '<p>Конкурс не найден.</p>'; return; }

    page.innerHTML = `
      <h1>${c.title}</h1>
      
      <div class="kv">
        <span class="badge">📅 ${c.date}</span>
        <span class="badge">📍 ${c.place}</span>
      </div>
      <p style="margin-top:8px">${c.excerpt||''}</p>
      <p>
        <a class="btn" href="${c.docs?.rules||'#'}" target="_blank">📄 Скачать положение (PDF)</a>
        ${c.docs?.results?` <a class="btn" href="${c.docs.results}" target="_blank">🏆 Результаты (PDF)</a>`:''}
      </p>`
    ;
      // <h2>Фотографии конкурса</h2>
      // <div class="gallery">
      //   ${(c.gallery||[]).map(src=>`<img src="${src}" alt="Фото конкурса">`).join('')}
      // </div>
      // Вставить код выше в функцую выше когда будут фото
    ;
  }

  // Архив — список прошедших конкурсов
  const archive = document.getElementById('archive-list');
  if(archive){
    const past = await loadArchive();
    archive.innerHTML = past.map(archiveCardHTML).join('');
  }
})();
