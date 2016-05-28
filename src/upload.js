
/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';
/** @enum {string} */
var FileType = {
  'GIF': '',
  'JPEG': '',
  'PNG': '',
  'SVG+XML': ''
};

/** @enum {number} */
var Action = {
  ERROR: 0,
  UPLOADING: 1,
  CUSTOM: 2
};

/** @enum {number} */
var resizeXValue = 0;
var resizeYValue = 0;
var resizeSizeValue = 0;

/**
 * Поля ввода значений формы кадрирования изображения
 * @type {string}
 */
var resizeX = document.querySelector('#resize-x');
var resizeY = document.querySelector('#resize-y');
var resizeSize = document.querySelector('#resize-size');
var resizeButton = document.querySelector('#resize-fwd');

var Resizer = require('./resizer');

/**
 * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
 * из ключей FileType.
 * @type {RegExp}
 */
var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

/**
 * @type {Object.<string, string>}
 */
var filterMap;

/**
 * Объект, который занимается кадрированием изображения.
 * @type {Resizer}
 */
var currentResizer;

/**
 * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
 * изображением.
 */
function cleanupResizer() {
  if (currentResizer) {
    currentResizer.remove();
    currentResizer = null;
  }
}

/**
 * Ставит одну из трех случайных картинок на фон формы загрузки.
 */
function updateBackground() {
  var images = [
    'img/logo-background-1.jpg',
    'img/logo-background-2.jpg',
    'img/logo-background-3.jpg'
  ];

  var backgroundElement = document.querySelector('.upload');
  var randomImageNumber = Math.round(Math.random() * (images.length - 1));
  backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
}

/**
 * Проверка, входят ли данные в допустимый диапазон значений.
 * Если да, включает кнопку отправки значений.
 * Если нет, выключает.
 * @return {boolean}
 */
var checkIsResizeFormValid = function() {
  resizeXValue = resizeX.valueAsNumber;
  resizeYValue = resizeY.valueAsNumber;
  resizeSizeValue = resizeSize.valueAsNumber;

  currentResizer.setConstraint(resizeXValue, resizeYValue, resizeSizeValue);

  if (resizeXValue >= 0
   && resizeYValue >= 0
   && resizeSizeValue >= 0
   && resizeX.validity.valid
   && resizeY.validity.valid
   && resizeSize.validity.valid
   && resizeXValue + resizeSizeValue <= currentResizer._image.naturalWidth
   && resizeYValue + resizeSizeValue <= currentResizer._image.naturalHeight) {
    resizeButton.removeAttribute('disabled');
    return true;
  }
  if (!(resizeButton.getAttribute('disabled'))) {
    resizeButton.setAttribute('disabled', true);
  } return false;
};

/**
 * Проверка валидации при изменении значения в форме кадрирования..
 */
resizeX.addEventListener('input', checkIsResizeFormValid);
resizeY.addEventListener('input', checkIsResizeFormValid);
resizeSize.addEventListener('input', checkIsResizeFormValid);

/**
 * Подключаем библиотеку browser-cookies.
 */
var browserCookies = require('browser-cookies');

/**
 * Выражение рассчитывает количество дней от последней даты дня рождения
 * до текущего дня.
 */
var thisDay = new Date();
var thisYear = thisDay.getFullYear();
var myBirthDay = new Date(thisYear + '-02-26');
var daysToExpire = Math.round((thisDay - myBirthDay) / 1000 / 24 / 60 / 60);

/**
 * Форма загрузки изображения.
 * @type {HTMLFormElement}
 */
var uploadForm = document.forms['upload-select-image'];

/**
 * Форма кадрирования изображения.
 * @type {HTMLFormElement}
 */
var resizeForm = document.forms['upload-resize'];

/**
 * Форма добавления фильтра.
 * @type {HTMLFormElement}
 */
var filterForm = document.forms['upload-filter'];

/**
 * @type {HTMLImageElement}
 */
var filterImage = filterForm.querySelector('.filter-image-preview');

/**
 * При загрузке страницы, записанный в cookies фильтр, выбирается
 * по умолчанию
 */
filterImage.className = 'filter-image-preview ' + 'filter-' + browserCookies.get('selectedFilter');

/**
 * Отмечает поле согласно записанному в cookie фильтру
 */
var elementForCheck = document.querySelectorAll('.upload-filter-controls input');

var checkedFilter = function(cookie, element) {
  if (cookie) {
    for (var i = 0; i < element.length; i++ ) {
      element[i].removeAttribute('checked');
      if (cookie === element[i].value) {
        element[i].setAttribute('checked', true);
      }
    }
  }
};

checkedFilter(browserCookies.get('selectedFilter'), elementForCheck);

/**
 * @type {HTMLElement}
 */
var uploadMessage = document.querySelector('.upload-message');

/**
 * @param {Action} action
 * @param {string=} message
 * @return {Element}
 */
function showMessage(action, message) {
  var isError = false;

  switch (action) {
    case Action.UPLOADING:
      message = message || 'Кексограмим&hellip;';
      break;

    case Action.ERROR:
      isError = true;
      message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
      break;
  }

  uploadMessage.querySelector('.upload-message-container').innerHTML = message;
  uploadMessage.classList.remove('invisible');
  uploadMessage.classList.toggle('upload-message-error', isError);
  return uploadMessage;
}

function hideMessage() {
  uploadMessage.classList.add('invisible');
}

/**
 * Обработчик изменения изображения в форме загрузки. Если загруженный
 * файл является изображением, считывается исходник картинки, создается
 * Resizer с загруженной картинкой, добавляется в форму кадрирования
 * и показывается форма кадрирования.
 * @param {Event} evt
 */
var changeUploadForm = function(evt) {
  var element = evt.target;
  if (element.id === 'upload-file') {
    // Проверка типа загружаемого файла, тип должен быть изображением
    // одного из форматов: JPEG, PNG, GIF или SVG.
    if (fileRegExp.test(element.files[0].type)) {
      var fileReader = new FileReader();

      showMessage(Action.UPLOADING);

      fileReader.onload = function() {
        cleanupResizer();

        currentResizer = new Resizer(fileReader.result);
        currentResizer.setElement(resizeForm);
        uploadMessage.classList.add('invisible');

        uploadForm.classList.add('invisible');
        resizeForm.classList.remove('invisible');

        hideMessage();
      };

      fileReader.readAsDataURL(element.files[0]);
    } else {
      // Показ сообщения об ошибке, если загружаемый файл, не является
      // поддерживаемым изображением.
      showMessage(Action.ERROR);
    }
  }
};

uploadForm.addEventListener('change', changeUploadForm);

/**
 * Обработка сброса формы кадрирования. Возвращает в начальное состояние
 * и обновляет фон.
 * @param {Event} evt
 */
var resetResizeForm = function(evt) {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  resizeForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
};

resizeForm.addEventListener('reset', resetResizeForm);

/**
 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
 * кропнутое изображение в форму добавления фильтра и показывает ее.
 * @param {Event} evt
 */
var submitResizeForm = function(evt) {
  evt.preventDefault();
  if (checkIsResizeFormValid()) {
    filterImage.src = currentResizer.exportImage().src;

    resizeForm.classList.add('invisible');
    filterForm.classList.remove('invisible');
  }
};

resizeForm.addEventListener('submit', submitResizeForm);

/**
 * Сброс формы фильтра. Показывает форму кадрирования.
 * @param {Event} evt
 */

var resetFilterForm = function(evt) {
  evt.preventDefault();

  filterForm.classList.add('invisible');
  resizeForm.classList.remove('invisible');
};

filterForm.addEventListener('reset', resetFilterForm);

/**
 * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
 * записав сохраненный фильтр в cookie.
 * @param {Event} evt
 */
var submitFilterForm = function(evt) {
  evt.preventDefault();

  cleanupResizer();
  updateBackground();

  filterForm.classList.add('invisible');
  uploadForm.classList.remove('invisible');
};

filterForm.addEventListener('submit', submitFilterForm);

/**
 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
 * выбранному значению в форме.
 */
var changeFilterForm = function(evt) {
  evt.preventDefault();
  if (!filterMap) {
    // Ленивая инициализация. Объект не создается до тех пор, пока
    // не понадобится прочитать его в первый раз, а после этого запоминается
    // навсегда.
    filterMap = {
      'none': 'filter-none',
      'chrome': 'filter-chrome',
      'sepia': 'filter-sepia'
    };
  }

  var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
    return item.checked;
  })[0].value;

  // Класс перезаписывается, а не обновляется через classList потому что нужно
  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
  // состояние или просто перезаписывать.
  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

  /**
   * Перед отправкой формы сохраняем в cookies последний выбранный фильтр.
   */
  browserCookies.set('selectedFilter', selectedFilter, {
    expires: daysToExpire
  });
};

filterForm.addEventListener('change', changeFilterForm);

/**
* Берет значения смещения и размера кадра из объекта currentResizer
* и добавляет их в форму.
*/
window.addEventListener('resizerchange', function() {
  var currentResizerValues = currentResizer.getConstraint();

  resizeX.value = currentResizerValues.x;
  resizeY.value = currentResizerValues.y;
  resizeSize.value = currentResizerValues.side;

  checkIsResizeFormValid();
});

cleanupResizer();
updateBackground();

module.exports = {
  changeUploadForm: changeUploadForm,
  resizer: Resizer
};
