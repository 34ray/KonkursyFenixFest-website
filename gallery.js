let galleryImages = [];
let currentImageIndex = 0;

// Загрузка данных галереи
async function loadGalleryData() {
  try {
    const response = await fetch('/data/gallery.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
    const images = await response.json();
    console.log('Загружено фотографий:', images.length);
    return images;
  } catch (error) {
    console.error('Ошибка загрузки галереи:', error);
    return [];
  }
}

// Сортировка по дате (от новых к старым)
function sortImagesByDate(images) {
  return images.sort((a, b) => {
    // Сортируем от новых к старым
    return new Date(b.date) - new Date(a.date);
  });
}



// Создание миниатюры
function createThumbnail(image, index) {
  return `
    <div class="gallery-item">
      <img src="${image.src}"" 
           onclick="openModal(${index})">
    </div>
  `;
}

// Открытие модального окна
function openModal(index) {
  currentImageIndex = index;
  
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const image = galleryImages[index];
  
  modal.style.display = "block";
  modalImg.src = image.src;
  document.body.style.overflow = "hidden";
}

// Закрытие модального окна
function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Смена изображения в модальном окне
function changeImage(direction) {
  currentImageIndex += direction;
  
  // Зацикливание
  if (currentImageIndex >= galleryImages.length) {
    currentImageIndex = 0;
  } else if (currentImageIndex < 0) {
    currentImageIndex = galleryImages.length - 1;
  }
  
  const modalImg = document.getElementById('modalImage');
  const image = galleryImages[currentImageIndex];
  
  modalImg.src = image.src;
}

// Настройка кликов по модальному окну
function setupModalClick() {
  const modal = document.getElementById('imageModal');
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
}

// Настройка клавиатуры
function setupKeyboardNavigation() {
  document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('imageModal');
    if (modal.style.display === "block") {
      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowLeft") {
        changeImage(-1);
      } else if (event.key === "ArrowRight") {
        changeImage(1);
      }
    }
  });
}

// Инициализация галереи
async function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  
  if (!galleryGrid) {
    console.log('Контейнер галереи не найден');
    return;
  }
  
  // Показываем загрузку
  galleryGrid.innerHTML = '<div class="loading">Загрузка фотографий...</div>';
  
  // Загружаем данные
  galleryImages = await loadGalleryData();
  
  if (galleryImages.length === 0) {
    galleryGrid.innerHTML = '<div class="no-photos">Фотографии скоро будут добавлены</div>';
    return;
  }

  // Загружаем и сортируем данные
  const images = await loadGalleryData();
  galleryImages = sortImagesByDate(images);
  
  if (galleryImages.length === 0) {
    galleryGrid.innerHTML = '<div class="no-photos">Фотографии скоро будут добавлены</div>';
    return;
  }
  
  // Рендерим миниатюры
  galleryGrid.innerHTML = galleryImages.map((image, index) => 
    createThumbnail(image, index)
  ).join('');
  
  // Настраиваем взаимодействие
  setupModalClick();
  setupKeyboardNavigation();
  
  // Закрытие по клику на крестик
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  
  console.log('Галерея инициализирована:', galleryImages.length, 'фото');
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initGallery();
});