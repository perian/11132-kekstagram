'use strict';

var galleryContainer = document.querySelector('.gallery-overlay');
var galleryPicture = galleryContainer.querySelector('img');
var picturesContainer = document.querySelector('.pictures');

var galleryPicturesList = [];
var indexOfPicture;

var KEYCODE = {
  'ESC': 27
};

/**
* @param {Array.<Object>} pictures
*/
var setGalleryPictures = function(pictures) {
  galleryPicturesList = pictures;
  picturesContainer.addEventListener('click', getIndexOfPicture);
  galleryContainer.addEventListener('click', _onPhotoClick);
  galleryContainer.addEventListener('keydown', _onDocumentKeyDown);
  galleryContainer.addEventListener('click', _onOverlayClick);
};

/**
* Отрисовывает фотографию по ее индексу в массиве.
* @param {number} index
*/
var renderGalleryPicture = function(index) {
  galleryPicture.width = 600;
  galleryPicture.height = 600;
  galleryContainer.querySelector('.gallery-overlay-controls-like').textContent = galleryPicturesList[index].likes;
  galleryContainer.querySelector('.gallery-overlay-controls-comments').textContent = galleryPicturesList[index].comments;
  galleryPicture.src = galleryPicturesList[index].url;
};

/**
* Начинает показ галереи с выбранной фотографии
* @param {Event} evt
*/
var getIndexOfPicture = function(evt) {
  evt.preventDefault();
  var target = evt.target;
  var galleryPicturesArray = Array.prototype.slice.call(picturesContainer.children);
  indexOfPicture = galleryPicturesArray.indexOf(target.parentNode);

  if (evt.target.parentNode.className === 'picture') {
    showGallery(indexOfPicture);
  }
};

/**
* Показывает следующую фотографию в списке
* @param {Event} evt
*/
var _onPhotoClick = function(evt) {
  if (evt.target.classList.contains('gallery-overlay-image')) {
    ++indexOfPicture;
    renderGalleryPicture(indexOfPicture);
  }
};

/**
* Вызывайте закрытие галереи по нажатию на Esc.
* @param {Event} evt
*/
var _onDocumentKeyDown = function(evt) {
  if (evt.keyCode === KEYCODE.ESC) {
    hideGallery();
  }
};

/**
* Вызывайте закрытие галереи по клику на оверлей вокруг фотографии.
* Удаляет обработчики событий.
* @param {Event} evt
*/
var _onOverlayClick = function(evt) {
  if (evt.target.classList.contains('gallery-overlay') ||
      evt.target.classList.contains('gallery-overlay-close')) {
    hideGallery();

    picturesContainer.removeEventListener('click', getIndexOfPicture);
    galleryContainer.removeEventListener('click', _onPhotoClick);
    galleryContainer.removeEventListener('keydown', _onDocumentKeyDown);
    galleryContainer.removeEventListener('click', _onOverlayClick);
  }
};

/**
* Отображает галерею начиная с выбранный картинки
* @param {number} firstpicturetoshow
*/
var showGallery = function(firstpicturetoshow) {
  var index = firstpicturetoshow;
  renderGalleryPicture(index);
  galleryContainer.classList.remove('invisible');
};

/**
* Скрывает галерею
*/
var hideGallery = function() {
  galleryContainer.classList.add('invisible');
};

module.exports = {
  setGalleryPictures: setGalleryPictures,
  showGallery: showGallery,
  galleryPicture: galleryPicture
};
