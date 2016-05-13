'use strict';

(function() {
  /**
  * Обьект который отрисовывет каждый элемент загруженных данных
  * @type {Photo}
  */
  var Photo = require('./render-picture');

  var gallery = require('./gallery');

  var blockOfFilters = document.querySelector('.filters');
  var picturesContainer = document.querySelector('.pictures');
  var pictureTemplateElement = document.getElementById('picture-template');
  if (!document.querySelector('.filters.hidden')) {
    blockOfFilters.classList.add('hidden');
  }

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

  // /** @type {number} */
  // var imageHeight = 0;

  /** @type {number} */
  var pageNumber = 0;

  gallery.setGalleryPictures(filteredPictures);

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
    var GAP = 300;

    return picturesContainerCoordinates.bottom - window.innerHeight - GAP <= 0;
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
})();
