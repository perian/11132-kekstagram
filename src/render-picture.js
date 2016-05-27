'use strict';

var gallery = require('./gallery');
var getPictureTemplate = require('get-picture-template');

/**
* @param {Object} data
* @constructor
*/
var Photo = function(data, pictureTemplateElement) {
  this.data = data;
  this.element = getPictureTemplate(this.data, pictureTemplateElement);
  this.onPhotoClick = function() {
    gallery.getIndexOfPicture();
  };

  this.element.addEventListener('click', this.onPhotoClick);

  this.remove = function() {
    this.element.removeEventListener('click', this.onPhotoClick);
    this.element.parentNode.removeChild(this.element);
  };
  pictureTemplateElement.appendChild(this.element);
};

module.exports = Photo;
