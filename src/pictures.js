'use strict';

(function() {
  var gallery = require('./gallery');

  /**
  * Обьект который отрисовывет каждый элемент загруженных данных
  * @type {Photo}
  */
  var Photo = require('./render-picture');

  var blockOfFilters = document.querySelector('.filters');
  if (!document.querySelector('.filters.hidden')) {
    blockOfFilters.classList.add('hidden');
  }

  var picturesContainer = document.querySelector('.pictures');
  var pictureTemplateElement = document.getElementById('picture-template');
  var image;

  /** @type {Array.<Object>} */
  var filteredPictures = [];

  /** @type {Array.<>} */
  var renderedPictures = [];

  var FILTER = {
    'POPULAR': 'filter-popular',
    'NEW': 'filter-new',
    'DISCUSSED': 'filter-discussed'
  };

  /** constant {number} */
  var PAGE_SIZE = 12;

  /** @type {number} */
  var imageHeight = 0;

  /** @type {number} */
  var pageNumber = 0;

  /**
  * Задаем ссылку для копирования элементов,
  * в зависимости от того поддерживает ли сайт тэг teamplate.
  */
  var elementToClone;
  if ('content' in pictureTemplateElement) {
    elementToClone = pictureTemplateElement.content.children[0];
  } else {
    elementToClone = pictureTemplateElement.children[0];
  }

  /**
  * Отрисовывает загруженные данные по шаблону.
  * @param {Object} data
  */
  var getPictureTemplate = function(data) {
    var pictureUploadExpectant;
    var PICTURE_UPLOAD_TIMEOUT = 10000;
    var picturesContainerElements = elementToClone.cloneNode(true);
    image = picturesContainerElements.querySelector('img');
    picturesContainerElements.querySelector('.picture-comments').textContent = data.comments;
    picturesContainerElements.querySelector('.picture-likes').textContent = data.likes;
    picturesContainer.appendChild(picturesContainerElements);

    image.onload = function() {
      clearTimeout(pictureUploadExpectant);
    };

    image.width = 182;
    image.height = 182;
    image.src = data.url;

    imageHeight = image.height;

    image.onerror = function() {
      picturesContainerElements.classList.add('picture-load-failure');
    };

    /**
    * Если за 10 секунд картинка не загрузилась, прерывает загрузку.
    */
    pictureUploadExpectant = setTimeout(function() {
      image.src = '';
      picturesContainerElements.classList.add('picture-load-failure');
    }, PICTURE_UPLOAD_TIMEOUT);

    /**
    * Отображает блок с фильтрами. После загрузки содержимого сайта.
    */
    if (document.querySelector('.filters.hidden')) {
      blockOfFilters.classList.remove('hidden');
    }
    gallery.setGalleryPictures(filteredPictures);

    return picturesContainerElements;
  };

  /**
  * Используем xmlHttpRequest для загрузки массива обьектов с сервера.
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
  var renderPictures = function(pictures, page) {
    var begin = page * PAGE_SIZE;
    var end = begin + PAGE_SIZE;

    pictures.slice(begin, end).forEach(function(picture) {
      renderedPictures.push(new Photo(picture, pictureTemplateElement));
    });
  };

  /**
  * Сортирует данные.
  * @param {Array.<Object>} pictures
  * @param {string} filter
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
  * Перерисовка загруженных данных в соответствии с выбранной кнопкой фильтра.
  * @param {Array.<Object>} pictures
  * @param {string} filter
  */
  var setFilterOnButton = function(pictures, filter) {
    filteredPictures = getFilteredPictures(pictures, filter);
    pageNumber = -1;
    drawNextPage(true);
  };

  /**
  * Проверяет наличие следующей страницы
  * @param {Array} pictures
  * @param {number} page
  * @param {number} pageSize
  * @return {boolean}
  */
  var isNextPageAvailable = function(pictures, page, pageSize) {
    return page < Math.floor(pictures.length / pageSize);
  };

  /**
  * Вычисляет расстояние от нижнего края блока картинок до нижнего края экрана.
  * @return {boolean}
  */
  var isBottomReached = function() {
    var picturesContainerCoordinates = picturesContainer.getBoundingClientRect();
    var GAP = 100;

    return picturesContainerCoordinates.bottom - imageHeight - window.innerHeight - GAP <= 0;
  };

  /**
  * Если не все страницы с элементами отрисованы
  *  и полоса прокрутки находится у нижней границы экрана,
  *  дорисовывает еще одну страницу.
  */
  var setScrollEnabled = function() {
    window.addEventListener('scroll', function() {
      clearTimeout(setScrollTimeout);
      var setScrollTimeout = setTimeout(function() {
        drawNextPage();
      });
    }, 100);
  };

  /**
  * Если не весь экран заполнен фотографиями,
  * отрисовывает страницы пока экран не заполнится.
  */
  var drawNextPage = function(reset) {
    if (reset) {
      renderedPictures.forEach(function(photo) {
        photo.remove();
      });

      renderedPictures = [];
    }

    while (isBottomReached() &&
      isNextPageAvailable(filteredPictures, pageNumber, PAGE_SIZE)) {
      renderPictures(filteredPictures, pageNumber);
      pageNumber++;
    }
  };

  /**
  * Включение кнопок cортировки загруженных данных
  * @param {Array.<Object>} pictures
  */
  var turnOnFilterButtons = function(pictures) {
    blockOfFilters.addEventListener('click', function(evt) {
      if (evt.target.classList.contains('filters-radio')) {
        setFilterOnButton(pictures, evt.target.id);
        gallery.setGalleryPictures(filteredPictures);
      }
    });
  };

  getPictures(function(loadedData) {
    var pictures = loadedData;

    turnOnFilterButtons(pictures);
    setFilterOnButton(pictures);
    setScrollEnabled();
  });

  module.exports = getPictureTemplate;
})();
