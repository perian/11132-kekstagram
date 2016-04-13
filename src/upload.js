/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
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
   * Поля ввода значений для кадрирования изображения
   * слева,
   * сверху,
   * сторона.
   * Кнопка отправки значений.
   */
  var resizeX = document.querySelector('#resize-x');
  var resizeY = document.querySelector('#resize-y');
  var resizeSize = document.querySelector('#resize-size');
  var resizeButton = document.querySelector('#resize-fwd');

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
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var minValue = 0;
    var resizeXValue = +resizeX.value;
    var resizeYValue = +resizeY.value;
    var resizeSizeValue = +resizeSize.value;

    /**
     * Проверка, входят ли данные в допустимый диапазон значений.
     * Если да, включает кнопку отправки значений.
     * Если нет, выкоючает.
     */
    if (resizeXValue > minValue &&
        resizeYValue > minValue &&
        resizeSizeValue > minValue &&
        resizeXValue + resizeSizeValue < currentResizer._image.naturalWidth &&
        resizeYValue + resizeSizeValue < currentResizer._image.naturalHeight) {
      if (resizeButton.getAttribute('disabled')) {
        resizeButton.removeAttribute('disabled');
      } return true;
    }
    if (!(resizeButton.getAttribute('disabled'))) {
      resizeButton.setAttribute('disabled', true);
    } return false;
  }

  /**
   * Проверка валидации при изменении значения в форме кадрирования.
   */
  resizeX.oninput = resizeFormIsValid;
  resizeY.oninput = resizeFormIsValid;
  resizeSize.oninput = resizeFormIsValid;

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
  uploadForm.onchange = function(evt) {
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

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };


  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function(evt) {
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

  cleanupResizer();
  updateBackground();
})();
