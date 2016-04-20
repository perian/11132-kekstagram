'use strict';

var hiddenBlockOfFilters = document.querySelector('.filters');
if (!document.querySelector('.filters.hidden')) {
  hiddenBlockOfFilters.classList.add('hidden');
}

var picturesContainer = document.querySelector('.pictures');
var pictureTemplateElement = document.getElementById('picture-template');

var FILTER = {
  'POPULAR': 'filter-popular',
  'NEW': 'filter-new',
  'DISCUSSED': 'filter-discussed'
};

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
    hiddenBlockOfFilters.classList.remove('hidden');
  }
};

/*
* Используем xmlHttpRequest для загрузки массива обьектов с сервера
*/
var getPictures = function(callback) {
  var xhr = new XMLHttpRequest();

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
      picturesContainer.classList.remove('pictures-loading');
    }
  };

  xhr.onerror = function() {
    if (xhr.status !== 200 ) {
      picturesContainer.classList.add('pictures-failure');
    }
  };

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    picturesContainer.classList.add('pictures-failure');
  };

  xhr.send();
};

/**
* Отрисовывает каждый элемент загруженных данных по шаблону.
* @param {Array.<Object>} pictures
*/
var renderPictures = function(pictures) {
  pictureTemplateElement.innerHTML = '';

  pictures.forEach(function(picture) {
    getPictureTemplate(picture, pictureTemplateElement);
  });
};

/**
* Сортирует данные
* @param {string} filter
* @param {Array.<Object>} pictures
*/
var getFilteredPictures = function(pictures, filter) {
  debugger;
  var picturesToFilter = pictures.slice(0);

  switch (filter) {
    case FILTER.NEW:
      picturesToFilter.sort(function(a, b) {
        if (Date.parse(a.date) > Date.parse(b.date)) {
          return 1;
        }
        if (Date.parse(a.date) < Date.parse(b.date)) {
          return -1;
        }
      });
      break;
  }

  return picturesToFilter;
};

/**
* Перерисовка загруженных данных в соответствии с выбранной кнопкой фильтра
* @param {string} filter
*/
var setFilterOnButton = function(pictures, filter) {
  var filteredPictures = getFilteredPictures(pictures, filter);
  renderPictures(filteredPictures);
};

/*
* Включение кнопок cортировки загруженных данных
*/
var tunrOnFilterButtons = function(pictures) {
  var filterButtons = hiddenBlockOfFilters.querySelectorAll('[name="filter"]');
  for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].onclick = function() {
      setFilterOnButton(pictures, this.id);
    };
  }
};

getPictures(function(loadedData) {
  var pictures = loadedData;
  renderPictures(pictures);
  tunrOnFilterButtons(pictures);
});
