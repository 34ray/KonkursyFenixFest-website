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
        <a class="btn-doc" href="${c.docs?.rules||'#'}" target="_blank">📄 Скачать положение (PDF)</a>
        
      </p>`
    ;
    // ${c.docs?.results?` <a class="btn" href="${c.docs.results}" target="_blank">🏆 Результаты (PDF)</a>`:''}
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


// Жюри
// Функции для страницы жюри с пагинацией
let currentPage = 1;
const jurorsPerPage = 3;
let allJury = [];

async function loadJury() {
  try {
    const res = await fetch('/data/jury.json');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const jury = await res.json();
    return jury;
  } catch (error) {
    console.error('Ошибка загрузки данных жюри:', error);
    return [];
  }
}

function juryCardHTML(jury) {
  return `
    <div class="jury-card">
      <div class="jury-photo">
        <img src="${jury.photo}" alt="${jury.name}" onerror="this.src='https://via.placeholder.com/300x400?text=Фото+жюри'">
      </div>
      <div class="jury-info">
        <h2 class="jury-name">${jury.name}</h2>
        <div class="jury-city">${jury.city}</div>
        <div class="jury-specialization">${jury.specialization}</div>
        <div class="jury-bio">
          <p>${jury.bio}</p>
        </div>
      </div>
    </div>
  `;
}

function renderJuryPage(page, jury) {
  const startIndex = (page - 1) * jurorsPerPage;
  const endIndex = startIndex + jurorsPerPage;
  const pageJurors = jury.slice(startIndex, endIndex);
  
  const juryContainer = document.getElementById('jury-list');
  juryContainer.innerHTML = pageJurors.map(juryCardHTML).join('');
  
  updatePaginationControls(page, jury.length);
}

function updatePaginationControls(currentPage, totalJurors) {
  const totalPages = Math.ceil(totalJurors / jurorsPerPage);
  const paginationContainer = document.getElementById('pagination-controls');
  
  let paginationHTML = '';
  
  // Кнопка "Назад"
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">‹ Назад</button>`;
  }
  
  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<span class="pagination-current">${i}</span>`;
    } else {
      paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
    }
  }
  
  // Кнопка "Вперед"
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">Вперед ›</button>`;
  }
  
  // Информация о странице
  paginationHTML += `<div class="pagination-info">Страница ${currentPage} из ${totalPages}</div>`;
  
  paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  renderJuryPage(currentPage, allJury);
  
  // Прокрутка к верху страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Загрузка данных жюри с пагинацией
(async function loadJuryPage() {
  console.log('Запуск загрузки страницы жюри...');
  const juryContainer = document.getElementById('jury-list');
  
  if (juryContainer) {
    allJury = await loadJury();
    
    if (allJury.length > 0) {
      renderJuryPage(1, allJury);
    } else {
      juryContainer.innerHTML = '<p class="no-data">Информация о жюри скоро появится</p>';
    }
  } else {
  }
})();