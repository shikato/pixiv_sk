// ==UserScript==
// @name           pixiv_sk
// @namespace      http://alexam.hateblo.jp/
// @author         shikato
// @description    pixivの検索結果をソートしたりフィルタリングしたり1ページに表示する数を増やしたりできます。
// @version        1.0.1
// @include        http://www.pixiv.net/search.php*
// @include        http://www.pixiv.net/tags.php*
// ==/UserScript==

(function (doc, func) {

  var head = doc.getElementsByTagName('head')[0]; 

  var jquery = doc.createElement('script'); 
  jquery.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js');
  jquery.addEventListener('load', function() {
    var myScript = doc.createElement('script');
    myScript.textContent = 'jQuery.noConflict();(' + func.toString() + ')(jQuery);';
    head.appendChild(myScript);
  }, false); 

  head.appendChild(jquery);
})(document, function ($) {

  /** 値の編集可能ここから **/
  
  // 1ページに作品を通常の何倍の数表示するか
  // ex) 1なら通常通り
  //     2にすると2ページ分になる（表示にかかる時間は+1秒）
  var PAGE_MULTIPLE = 3;
  // 作品のブックマーク数が以下の値未満の場合は表示しない
  var FAV_FILTER = 3;
  // リンクを別のタブで開くかどうか true or false
  var IS_LINK_BLANK = true; 

  /** 値の編集可能ここまで **/ 

  var LOADING_IMG = 'https://raw.githubusercontent.com/shikato/pixiv_sk/master/loading.gif';

  if (PAGE_MULTIPLE < 1 || FAV_FILTER < 0) {
    return;
  } 

  var mCurrentGotPage = null;
  var mCurrentUrl = null;
  var mCurrentPage = null;
  var mGetPageLimit = null; 


  // 次のページの作品を取得する
  var getNextPage = function () { 
    var url = mCurrentUrl;

    if (mCurrentPage === 1) {
      mCurrentPage++;    
      url += ('&p='+mCurrentPage); 
    } else {
      mCurrentPage++;    
      url = mCurrentUrl.replace(/p=\d+/, 'p='+mCurrentPage); 
    }

    if (mCurrentPage > mGetPageLimit) {
      return;
    }

    mCurrentUrl = url; 

    var req = new XMLHttpRequest();
    req.open('GET', mCurrentUrl, true);
    req.onload = function (event) { 
      $(req.responseText).find('.column-search-result').children('._image-items').children('.image-item').each(function() {
        $('.column-search-result').children('ul').append($(this));
      });
      mCurrentGotPage++;
      // PAGE_MULTIPLEで指定した分だけ取得したらソートして表示
      if (mCurrentGotPage === (PAGE_MULTIPLE-1)) {
        $('#loading').remove();
        var sortedImages = filterAndSort();
        $('.column-search-result').children('ul').empty().append(sortedImages).show(); 
      }
      req = null;
    };
    req.onerror = function (event) {
      alert('画像の取得に失敗しました。');
      req = null;
    };

    req.send(null);

    // 1秒後にリクエスト
    setTimeout(function () {
      getNextPage(mCurrentPage);
    }, 1000);
  };
   

  // 表示されている作品をフィルタリングしてソートする
  var filterAndSort = function () {
    // FAV_FILTER未満の作品をremove
    $('.column-search-result').children('._image-items').children('.image-item').each(function() {
      var fav = $(this).children('ul').children('li:first').children('a').text();
      if (fav < FAV_FILTER) {
        $(this).remove();
      } else {
        // blank onの場合 target属性追加
        if (!IS_LINK_BLANK) {
          return;
        }
        $(this).children('a').attr('target', 'blank');
      }
    });
    var images = $('.column-search-result').children('._image-items').children('.image-item').map(function() {
      return $(this);
    });

    // ソート
    images.sort(function (a, b) {
      var favA = $(a).children('ul').children('li:first').children('a').text();
      var favB = $(b).children('ul').children('li:first').children('a').text();
      if (favA === '') {
        favA = 0; 
      } else {
        favA = parseInt(favA); 
      }
      if (favB === '') {
        favB = 0; 
      } else {
        favB = parseInt(favB); 
      }
      if (favA > favB) {
        return -1;
      }
      if (favA < favB) {
        return 1;
      }
      return 0;
    }); 

    var results = '';
    for (var i = 0; i < images.length; i++) { 
      results += $('<div>').append(images[i]).html();                    
    }
    return results;
  } 


  mCurrentGotPage = 0;
  mCurrentUrl = location.href;
  mCurrentPage = mCurrentUrl.match(/p=(\d+)/);

  if (mCurrentPage !== null) {
    mCurrentPage = parseInt(mCurrentPage[1]);
    mGetPageLimit = (PAGE_MULTIPLE - 1) + mCurrentPage;
  } else {
    mCurrentPage = 1;
    mGetPageLimit = PAGE_MULTIPLE;
  }

  if (PAGE_MULTIPLE > 1) {
    // load時のスピナー表示
    $('.column-search-result').children('ul').hide();
    $('.column-search-result').prepend(
      '<div id="loading" style="width:50px;margin-left:auto;margin-right:auto;">'+
      '<img src="' + LOADING_IMG + '" /></div>'
    );

    // pixiv_sk用のページネーションリンク表示
    if (mCurrentPage === 1) {
      $('.pager-container').empty().append(
        '<a href="'+mCurrentUrl+'" style="margin-right:15px;">&lt;&lt;</a>'+
        '<a href="'+mCurrentUrl+'&p='+(mCurrentPage+PAGE_MULTIPLE)+'">&gt;</a>'
      ); 
    } else {
      $('.pager-container').empty().append(
        '<a href="'+mCurrentUrl.replace(/&p=\d+/, '')+'" style="margin-right:15px;">&lt;&lt;</a>'+
        '<a href="'+mCurrentUrl.replace(/p=\d+/, 'p='+(mCurrentPage-PAGE_MULTIPLE))+'" style="margin-right:10px;">&lt;</a>'+
        '<a href="'+mCurrentUrl.replace(/p=\d+/, 'p='+(mCurrentPage+PAGE_MULTIPLE))+'" style="margin-right:10px;">&gt;</a>'
      ); 
    }
    // PAGE_MULTIPLEで指定したページ分取得する
    getNextPage();
  } else {
    var sortedImages = filterAndSort();
    $('.column-search-result').children('ul').empty().append(sortedImages);
  }

  // 被さって表示されてしまう要素をremove
  $('.popular-introduction').remove();
});
