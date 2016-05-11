'use strict';

var getPictureTemplate = require('./pictures');
var gallery = require('./gallery');

/**
* @param {Object} data
* @constructor
*/
var Photo = function(picture, pictureTemplateElement) {
  this.data = picture;
  this.element = getPictureTemplate(this.data, pictureTemplateElement);
  this.onPhotoClick = function() {
    gallery.getIndexOfPicture();
  };

  this.element.addEventListener('click', this.onPhotoClick);
  pictureTemplateElement.appendChild(this.element);

  this.remove = function() {
    this.element.removeEventListener('click', this.onPhotoClick);
    this.element.parentNode.removeChild(this.element);
    pictureTemplateElement.appendChild('');
  };
};

module.exports = Photo;
