// ==UserScript==
// @name           pixiv_sk
// @namespace      http://alexam.hateblo.jp/
// @author         shikato
// @description    pixivの検索結果をフィルタリングしソートします。
// @version        2.1.0
// @include        https://www.pixiv.net/search.php*
// @include        https://www.pixiv.net/tags.php*
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// ==/UserScript==


/** 設定値 ここから **/

// 作品のブックマーク数が以下の値未満の場合は表示しない
var FAV_FILTER = 3;
// リンクを別のタブで開くかどうか true / false
var IS_LINK_BLANK = true; 

/** 設定値 ここまで **/ 


var getFav = function (target) { 
  var favText = target.children('figure').children('figcaption').children('ul').children('li:nth-child(3)').children('ul').children('li').children('a').text(); 
  if (favText === '') {
    return 0;
  } else { 
    return parseInt(favText);
  }
};

// filtering and sorting
var filterAndSort = function () {
  var works = []; 

  // fav filtering
  $('._1BUAfFH').children('._25taFA4').each(function () { 
    var fav = getFav($(this)); 
    if (fav >= FAV_FILTER) { 
      // If IS_LINK_BLANK is true, target blank attribute is added.
      if (!IS_LINK_BLANK) {
        return;
      }
      $(this).children('figure').children('._3NnoQkv').children('a').attr('target', 'blank').attr('rel', '');
      works.push($(this));
    }
  });

  // sorting
  works.sort(function (a, b) {
    var favA = getFav(a); 
    var favB = getFav(b); 
    if (favA > favB) {
      return -1;
    }
    if (favA < favB) {
      return 1;
    }
    return 0;
  }); 

  // create result(html characters)
  var results = ''; 
  works.forEach(function (work) {
    results += $('<div>').append(work).html();
  }); 

  return results;
}; 

var isFinishedLazyloaded = function () { 
  var isFinished = true;
  $('._1BUAfFH').children('._25taFA4').each(function () { 
    if ($(this).children('figure').children('._3NnoQkv').children('a').children('._309ad3C').css('background-image') === 'none') {
      isFinished = false; 
    }
  });
  return isFinished;
};

var pisivSkInterval = setInterval(function () {
  if ($('._1BUAfFH').length) {
    if (isFinishedLazyloaded()) { 
      var sortedWorks = filterAndSort(); 
      $('._1BUAfFH').empty().append(sortedWorks).show(); 
      clearInterval(pisivSkInterval); 
    }  
  }
}, 100); 
