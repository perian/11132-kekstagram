function getMessage(a, b) {
  var boolean = true;  
  var integer = 1;
  var array = [];
  var square = 0;
  var sum = 0;
  var i;
  if ((typeof a) === (typeof boolean)) {
    if(a) {
      return ("Переданное GIF-изображение анимировано и содержит " + a + " кадров");
    } else {
      return ("Переданное GIF-изображение не анимировано");
    }
  } 
  else if ((typeof a) === (typeof integer)) {
    return ("Переданное SVG-изображение содержит " + a + " объектов и " + b * 4 + " атрибутов");
  } 
  else if ((typeof a === typeof{}) && (typeof b === typeof{})) {
    for (i = 0; i < a.length; i++) {
      square += a[i] * b[i];
    } return ("Общая площадь артефактов сжатия: " + square + " пикселей");
  }
  else {
    for (i = 0; i < a.length; i++) {
     sum += a[i];
    } return ("Количество красных точек во всех строчках изображения: " + sum);
  } 
}
