// ==UserScript==
// @name           pixiv_sk
// @namespace      http://alexam.hateblo.jp/
// @author         shikato
// @description    pixivの検索結果をフィルタリングしソートします。
// @version        1.1.1
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


if (FAV_FILTER < 0) {
  return;
}

var getFav = function (target) { 
  var favText = target.children('figure').children('figcaption').children('ul').children('li:lt(3)').children('ul').children('li').children('a').text(); 
  if (favText === '') {
    return 0;
  } else { 
    return parseInt(favText);
  }
};

// worksをフィルタリングしてソートしてHTML(文字列)を返す
var filterAndSort = function () {
  var works = []; 

  // FAV_FILTER未満の作品をremove
  $('._2xrGgcY').children('._7IVJuWZ').each(function() { 
    var fav = getFav($(this)); 
    if (fav >= FAV_FILTER) { 
      // blank onの場合 target属性追加
      if (!IS_LINK_BLANK) {
        return;
      }
      $(this).children('figure').children('div').children('a').attr('target', 'blank').attr('rel', '');
      works.push($(this));
    }
  });

  // ソート 
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

  var results = ''; 
  for (var i = 0; i < works.length; i++) { 
    results += $('<div>').append(works[i]).html();                    
  }

  return results;
}; 

var pisivSkInterval = setInterval(function () {
  if ($('._2xrGgcY').length) { 
    var sortedWorks = filterAndSort(); 
    $('._2xrGgcY').empty().append(sortedWorks).show(); 
    clearInterval(pisivSkInterval); 
    return;
  }
}, 5); 
