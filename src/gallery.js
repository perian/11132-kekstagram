'use strict';

// /** Загруженный массив обьектов с сервера.*/
// /** @type {Array.<Object>} pictures */
// var pictures = require('./pictures');
// console.log(pictures.filteredPictures);
// /** @type {Array.<Object>} */
// var galleryPicturesList = [];
//
// /** @param {Array.<Object>} pictures */
// var savePicturesList = function(pictures) {
//   galleryPicturesList = pictures;
// };

var picturesContainer = document.querySelector('.pictures');
var galleryContainer = document.querySelector('.gallery-overlay');
var galleryPicture = galleryContainer.querySelector('img');

var picturesArray;
var selectedPicture;
// var KEYCODE = {
//   'ESC': 27
// };

/** Начинает показ галереи с выбранной фотографии*/
var selectPicture = function(evt) {
  evt.preventDefault();
  var target = evt.target;
  picturesArray = Array.prototype.slice.call(picturesContainer.children);
  selectedPicture = picturesArray.indexOf(target.parentNode);
  galleryPicture.src = target.src;
  console.log(target.parentNode);
  console.dir(evt.target);

  if (evt.target.parentNode.className === 'picture') {
    showGallery(selectedPicture);
  }
};

picturesContainer.addEventListener('click', selectPicture);

/** Показывает следующую фотографию*/
var _onPhotoClick = function(evt) {
  if (evt.target.classList.contains('gallery-overlay-image')) {
    ++selectedPicture;
    galleryPicture.src = picturesArray[selectedPicture].childNodes[1].src;
  }
};

galleryContainer.addEventListener('click', _onPhotoClick);

/** Вызывайте закрытие галереи по нажатию на Esc. */
var _onDocumentKeyDown = function(evt) {
  if ([27].indexOf(evt.keyCode) > -1) {
    evt.preventDefault();
    hideGallery();
  }
};

galleryContainer.addEventListener('keydown', _onDocumentKeyDown);

/**
* Вызывайте закрытие галереи по клику на оверлей вокруг фотографии.
* Удаляет обработчики событий.
*/
var _onOverlayClick = function(evt) {
  if (evt.target.classList.contains('gallery-overlay') ||
      evt.target.classList.contains('gallery-overlay-close')) {
    hideGallery();
  }
};

galleryContainer.addEventListener('click', _onOverlayClick);

/**
* Отображает галерею начиная с выбранный картинки
* @param {number} selectedPicture
*/
var showGallery = function() {
  galleryContainer.querySelector('.gallery-overlay-controls-like').textContent = selectedPicture.like;
  galleryContainer.querySelector('.gallery-overlay-controls-comments').textContent = selectedPicture.comments;

  galleryContainer.classList.remove('invisible');
  console.dir(selectedPicture);
};

/** Скрывает галерею */
var hideGallery = function() {
  galleryContainer.classList.add('invisible');
};

module.exports = {
  selectPicture: selectPicture
};
