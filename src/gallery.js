'use strict';

var Gallery = function() {
  var self = this;
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
  this.setGalleryPictures = function(pictures) {
    galleryPicturesList = pictures;
  };

  /**
  * Отрисовывает фотографию по ее индексу в массиве.
  * @param {number} index
  */
  this.renderGalleryPicture = function(index) {
    galleryPicture.width = 600;
    galleryPicture.height = 600;
    galleryContainer.querySelector('.likes-count').textContent = galleryPicturesList[index].likes;
    galleryContainer.querySelector('.comments-count').textContent = galleryPicturesList[index].comments;
    galleryPicture.src = galleryPicturesList[index].url;
  };

  /*
  * Начинает показ галереи с выбранной dфотографии
  * @param {Event} evt
  */
  this.openGallery = function(evt) {
    evt.preventDefault();
    var target = evt.target;
    var galleryPicturesArray = Array.prototype.slice.call(picturesContainer.children);
    indexOfPicture = galleryPicturesArray.indexOf(target.parentNode);

    if (evt.target.parentNode.className === 'picture') {
      self.renderGalleryPicture(indexOfPicture);
      self.showGallery();
    }
  };

  /**
  * Показывает следующую фотографию в списке
  * @param {Event} evt
  */
  this._onPhotoClick = function(evt) {
    if (evt.target.classList.contains('gallery-overlay-image')) {
      ++indexOfPicture;
      self.renderGalleryPicture(indexOfPicture);
    }
  };

  /**
  * Вызывайте закрытие галереи по нажатию на Esc.
  * @param {Event} evt
  */
  this._onDocumentKeyDown = function(evt) {
    if (evt.keyCode === KEYCODE.ESC) {
      self.hideGallery();
    }
  };

  /**
  * Вызывайте закрытие галереи по клику на оверлей вокруг фотографии.
  * Удаляет обработчики событий.
  * @param {Event} evt
  */
  this._onOverlayClick = function(evt) {
    if (evt.target.classList.contains('gallery-overlay') ||
        evt.target.classList.contains('gallery-overlay-close')) {
      self.hideGallery();

      galleryContainer.removeEventListener('click', self._onPhotoClick);
      document.removeEventListener('keydown', self._onDocumentKeyDown);
      galleryContainer.removeEventListener('click', self._onOverlayClick);
    }
  };

  /**
  * Отображает галерею начиная с выбранный картинки
  * @param {number} firstpicturetoshow
  */
  this.showGallery = function() {
    galleryContainer.classList.remove('invisible');

    galleryContainer.addEventListener('click', self._onPhotoClick);
    document.addEventListener('keydown', self._onDocumentKeyDown);
    galleryContainer.addEventListener('click', self._onOverlayClick);
  };

  /**
  * Скрывает галерею
  */
  this.hideGallery = function() {
    galleryContainer.classList.add('invisible');
  };
};

module.exports = {
  galleryPicture: new Gallery()
};
