'use strict';

var hiddenBlockOfFilters = document.querySelector('.filters');
if (!document.querySelector('.filters.hidden')) {
  hiddenBlockOfFilters.classList.add('hidden');
}

var pictureUploadExpectant;
var picturesContainer = document.querySelector('.pictures');
var pictureTemplateElement = document.getElementById('picture-template');

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
*
*/
var getPictureTemplate = function(data) {
  var PICTURE_UPLOAD_TIMEOUT = 10000;
  var picturesContainerElements = elementToClone.cloneNode(true);
  picturesContainerElements.querySelector('.picture-comments').textContent = data.comments;
  picturesContainerElements.querySelector('.picture-likes').textContent = data.likes;
  picturesContainer.appendChild(picturesContainerElements);

  /*
  *
  */
  var image = new Image();
  image = elementToClone.querySelector('img');

  image.onload = function() {
    clearTimeout(pictureUploadExpectant);
  };

  image.width = 182;
  image.height = 182;
  image.src = data.url;

  image.onerror = function() {
    elementToClone.classList.add('picture-load-failure');
  };

  /*
  * Если за 10 секкунд картинка не загрузилась, прерывает загрузку.
  */
  pictureUploadExpectant = setTimeout(function() {
    image.src = '';
    elementToClone.classList.add('picture-load-failure');
  }, PICTURE_UPLOAD_TIMEOUT);


  /*
  * Отображает блок с фильтрами. После загрузки содержимого сайта.
  */
  if (document.querySelector('.filters.hidden')) {
    hiddenBlockOfFilters.classList.remove('hidden');
  }
};

window.pictures.forEach(function(picture) {
  getPictureTemplate(picture, pictureTemplateElement);
});
