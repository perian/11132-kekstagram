'use strict';

var blockOfFilters = document.querySelector('.filters');
if (!document.querySelector('.filters.hidden')) {
  blockOfFilters.classList.add('hidden');
}

var picturesContainer = document.querySelector('.pictures');
var pictureTemplateElement = document.getElementById('picture-template');

/** @type {Array.<Object>} */
var filteredPictures = [];

var FILTER = {
  'POPULAR': 'filter-popular',
  'NEW': 'filter-new',
  'DISCUSSED': 'filter-discussed'
};

/** constant {number} */
var PAGE_SIZE = 12;

/** @type {number} */
var pageNumber = 0;
/*
* Задаем ссылку для копирования элементов,
* в зависимости от того поддерживает ли сайт тэг teamplate
*/
var elementToClone;
if ('content' in pictureTemplateElement) {
  elementToClone = pictureTemplateElement.content.children[0];
} else {
  elementToClone = pictureTemplateElement.children[0];
}

/*
* Отрисовывает загруженные данные по шаблону
*/
var getPictureTemplate = function(data) {
  var pictureUploadExpectant;
  var PICTURE_UPLOAD_TIMEOUT = 10000;
  var picturesContainerElements = elementToClone.cloneNode(true);
  var image = picturesContainerElements.querySelector('img');
  picturesContainerElements.querySelector('.picture-comments').textContent = data.comments;
  picturesContainerElements.querySelector('.picture-likes').textContent = data.likes;
  picturesContainer.appendChild(picturesContainerElements);

  image.onload = function() {
    clearTimeout(pictureUploadExpectant);
  };

  image.width = 182;
  image.height = 182;
  image.src = data.url;

  image.onerror = function() {
    picturesContainerElements.classList.add('picture-load-failure');
  };

  /*
  * Если за 10 секунд картинка не загрузилась, прерывает загрузку.
  */
  pictureUploadExpectant = setTimeout(function() {
    image.src = '';
    picturesContainerElements.classList.add('picture-load-failure');
  }, PICTURE_UPLOAD_TIMEOUT);

  /*
  * Отображает блок с фильтрами. После загрузки содержимого сайта.
  */
  if (document.querySelector('.filters.hidden')) {
    blockOfFilters.classList.remove('hidden');
  }
};

/*
* Используем xmlHttpRequest для загрузки массива обьектов с сервера
*/
var getPictures = function(callback) {
  var xhr = new XMLHttpRequest();
  var removePreloader = function() {
    picturesContainer.classList.remove('pictures-loading');
  };

  xhr.open('GET', '//o0.github.io/assets/json/pictures.json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4 ) {
      picturesContainer.classList.add('pictures-loading');
    }
  };

  xhr.onload = function(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
    if (xhr.readyState === 4 ) {
      removePreloader();
    }
  };

  xhr.onerror = function() {
    if (xhr.status !== 200 ) {
      picturesContainer.classList.add('pictures-failure');
    }
    removePreloader();
  };

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    picturesContainer.classList.add('pictures-failure');
    removePreloader();
  };

  xhr.send();
};

/**
* Отрисовывает каждый элемент загруженных данных по шаблону.
* @param {Array.<Object>} pictures
* @param {number} page
*/
var renderPictures = function(pictures, page, replace) {
  if (replace) {
    picturesContainer.innerHTML = '';
  }

  var begin = page * PAGE_SIZE;
  var end = begin + PAGE_SIZE;
  pictures.slice(begin, end).forEach(function(picture) {
    getPictureTemplate(picture, pictureTemplateElement);
  });
};

/**
* Сортирует данные
* @param {string} filter
* @param {Array.<Object>} pictures
*/
var getFilteredPictures = function(pictures, filter) {
  var picturesToFilter = pictures.slice(0);
  var compareDates = function(a, b) {
    return Date.parse(b.date) - Date.parse(a.date);
  };
  var compareComments = function(a, b) {
    return b.comments - a.comments;
  };

  switch (filter) {
    case FILTER.NEW:
      picturesToFilter.sort(compareDates);
      break;
    case FILTER.DISCUSSED:
      picturesToFilter.sort(compareComments);
      break;
  }

  return picturesToFilter;
};

/**
* Перерисовка загруженных данных в соответствии с выбранной кнопкой фильтра
* @param {string} filter
*/
var setFilterOnButton = function(pictures, filter) {
  filteredPictures = getFilteredPictures(pictures, filter);
  pageNumber = 0;
  renderPictures(filteredPictures, pageNumber, true);
};

/**
* @param {Array} pictures
* @param {number} page
* @param {number} pageSize
* @return {boolean}
*/
var isNextPageAvailable = function(pictures, page, pageSize) {
  return page < Math.floor(pictures.length / pageSize);
};

/**
* @return {boolean}
*/
var isBottomReached = function() {
  var allPictures = picturesContainer.querySelectorAll(['.picture']);
  var lastPicture = allPictures[allPictures.length - 1];
  var lowestPicturesPoisiton = lastPicture.getBoundingClientRect();
  var GAP = 100;

  return lowestPicturesPoisiton.top - window.innerHeight - GAP <= 0;
};

/* Если не все страницы с элементами отрисованы
*  и полоса прокрутки находится у нижней границы экрана,
*  дорисовывает еще одну страницу. */
var setScrollEnabled = function() {
  clearTimeout(setScrollTimeout);
  var setScrollTimeout = setTimeout(function() {
    window.addEventListener('scroll', function() {
      if (isBottomReached() &&
        isNextPageAvailable(filteredPictures, pageNumber, PAGE_SIZE)) {
        pageNumber++;
        renderPictures(filteredPictures, pageNumber);
      }
    });
  }, 100);
};

/* Если не весь экран заполнен фотографиями,
*  отрисовывает страницы пока экран не заполнится. */
var isWindowFullOfPictures = function() {
  var allPictures = picturesContainer.querySelectorAll(['.picture']);
  var lastPicture = allPictures[allPictures.length - 1];
  var lowestPicturesPoisiton = lastPicture.getBoundingClientRect();

  if (lowestPicturesPoisiton.bottom > 0) {
    renderPictures(filteredPictures, pageNumber);
    pageNumber++;
  }
};

/* Включение кнопок cортировки загруженных данных */
var tunrOnFilterButtons = function(pictures) {
  blockOfFilters.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('filters-radio')) {
      setFilterOnButton(pictures, evt.target.id);
    }
  });
};

getPictures(function(loadedData) {
  var pictures = loadedData;
  renderPictures(pictures);
  tunrOnFilterButtons(pictures);
  setFilterOnButton(pictures);
  setScrollEnabled();
  isWindowFullOfPictures();
});
