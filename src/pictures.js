'use strict';

var hiddenBlockOfFilters = document.querySelector('.filters');
if (!document.querySelector('.filters.hidden')) {
  hiddenBlockOfFilters.classList.add('hidden');
}

var picturesContainer = document.querySelector('.pictures');
var pictureTemplateElement = document.querySelector('template');
var elementToClone;

if ('content' in pictureTemplateElement) {
  elementToClone = pictureTemplateElement.content.children[0].cloneNode(true);
} else {
  elementToClone = pictureTemplateElement.children[0].cloneNode(true);
}

var getPictureTemplate = function(data) {
  elementToClone.querySelector('.picture-comments').textContent = data.comments;
  elementToClone.querySelector('.picture-likes').textContent = data.likes;
  picturesContainer.appendChild(elementToClone);
  var image = new Image();
  image.onload = function(evt) {
    elementToClone.querySelector('img').setAttribute('src', evt.target.src);
    image.width = 182;
    image.height = 182;
  };
  //
  // image.onerror = function() {
  //   picturesContainer.classList.add('picture-load-failure');
  // };

  image.src = data.preview;
};

window.pictures.forEach(function(picture) {
  getPictureTemplate(picture, pictureTemplateElement);
});
