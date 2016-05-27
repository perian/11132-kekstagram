'use strict';

var picturesContainer = document.querySelector('.pictures');
var pictureTemplateElement = document.getElementById('picture-template');
var blockOfFilters = document.querySelector('.filters');
var image;

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

  // imageHeight = image.height;

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
};

module.exports = getPictureTemplate;
