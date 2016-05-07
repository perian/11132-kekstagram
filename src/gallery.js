'use strict';

/** Загруженный массив обьектов с сервера.*/
/** @type {Array.<Object>} pictures */
// var pictures = require('./pictures');

/** @type {Array.<Object>} */
// var galleryPicturesList = [];

// var selectedPicture = document.pictures.querySelectorAll('picture');

/** Показывает галлерею фотографий, начиная с выбранной
* @type {Array.<Object>} pictures
*/
var showGallery = function(pictures) {
  var galleryPicturesList = pictures;
  var galleryContainer = document.querySelector('.gallery-overlay');
  galleryContainer.classList.remove('invisible');
};

module.exports = showGallery;
