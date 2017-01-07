// ==UserScript==
// @name           pixiv_sk
// @namespace      http://alexam.hateblo.jp/
// @author         shikato
// @description    pixivの検索結果をソートしたりフィルタリングしたり1ページに表示する数を増やしたりできます。
// @version        1.1.0
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

  /** 設定値 ここから **/
  
  // 1ページに何ページ分の作品を表示するか
  // ex) 1なら通常通り
  //     2にすると2ページ分表示
  var GETTING_PAGE_COUNT = 3;
  // 作品のブックマーク数が以下の値未満の場合は表示しない
  var FAV_FILTER = 3;
  // リンクを別のタブで開くかどうか true / false
  var IS_LINK_BLANK = true; 

  /** 設定値 ここまで **/ 

  var LOADING_IMG = 'https://raw.githubusercontent.com/shikato/pixiv_sk/master/loading.gif';

  if (GETTING_PAGE_COUNT < 1 || FAV_FILTER < 0) return;

  var mCurrentGettingPageCount = null;
  var mCurrentUrl = null;
  var mCurrentPage = null;
  var mWorks = [];

  // mCurrentPageの作品を取得する
  var getWorks = function (onloadCallback) { 
    var url = mCurrentUrl;

    if (mCurrentPage === 1) {
      url += ('&p='+mCurrentPage); 
    } else {
      url = mCurrentUrl.replace(/p=\d+/, 'p='+mCurrentPage); 
    } 
    mCurrentUrl = url; 

    var req = new XMLHttpRequest();
    req.open('GET', mCurrentUrl, true);
    req.onload = function (event) {
      onloadCallback(req); 
      req = null;
    };
    req.onerror = function (event) {
      alert('作品の取得に失敗しました。');
      req = null;
    };

    req.send(null); 
  };
  
  // mWorksをフィルタリングしてソートして文字列としてHTMLを返す
  var filterAndSort = function () {
    // FAV_FILTER未満の作品をremove 
    mWorks.forEach(function (work, i) { 
      var fav = work.children('ul').children('li:first').children('a').text();
      if (fav < FAV_FILTER) {
        mWorks.splice(i, 1);
      } else {
        // blank onの場合 target属性追加
        if (!IS_LINK_BLANK) return;
        work.children('a').attr('target', 'blank');
      }
    });

    // ソート 
    mWorks.sort(function (a, b) {
      var favA = a.children('ul').children('li:first').children('a').text();
      var favB = b.children('ul').children('li:first').children('a').text();
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
    for (var i = 0; i < mWorks.length; i++) { 
      results += $('<div>').append(mWorks[i]).html();                    
    }

    return results;
  }; 


  mCurrentGettingPageCount = 0;
  mCurrentUrl = location.href;
  mCurrentPage = mCurrentUrl.match(/p=(\d+)/); 

  if (mCurrentPage !== null) {
    mCurrentPage = parseInt(mCurrentPage[1]);
  } else {
    mCurrentPage = 1;
  }

  if (GETTING_PAGE_COUNT > 1) {
    // load時のスピナー表示
    $('.column-search-result').children('ul').hide(); 
    $('.column-search-result').prepend(
      '<div id="loading" style="width:50px;margin-left:auto;margin-right:auto;">'
       + '<img src="' + LOADING_IMG + '" /></div>'
    );

    // pixiv_sk用のページネーションリンク表示
    if (mCurrentPage === 1) {
      $('.pager-container').empty().append(
        '<a href="' + mCurrentUrl + '" style="margin-right:15px;">&lt;&lt;</a>'
         + '<a href="' + mCurrentUrl + '&p=' + (mCurrentPage+GETTING_PAGE_COUNT) +'">&gt;</a>'
      ); 
    } else {
      $('.pager-container').empty().append(
        '<a href="'+mCurrentUrl.replace(/&p=\d+/, '') + '" style="margin-right:15px;">&lt;&lt;</a>'
         + '<a href="'+mCurrentUrl.replace(/p=\d+/, 'p=' + (mCurrentPage - GETTING_PAGE_COUNT)) + '" style="margin-right:10px;">&lt;</a>'
         + '<a href="'+mCurrentUrl.replace(/p=\d+/, 'p=' + (mCurrentPage + GETTING_PAGE_COUNT)) + '" style="margin-right:10px;">&gt;</a>'
      ); 
    }

    var onloadCallback = function (req) { 
      $(req.responseText).find('.column-search-result').children('._image-items').children('.image-item').each(function() {
        var thumb = $(this).children('.work').children('._layout-thumbnail').children('._thumbnail');
        thumb.attr('src', thumb.attr('data-src')); 
        mWorks.push($(this));
      }); 

      mCurrentPage++; 
      mCurrentGettingPageCount++; 
      // GETTING_PAGE_COUNTで指定した分だけ作品を取得したらソートして表示
      if (mCurrentGettingPageCount === GETTING_PAGE_COUNT) {
        $('#loading').remove();
        var sortedImages = filterAndSort();
        $('.column-search-result').children('ul').empty().append(sortedImages).show(); 
      } else { 
        getWorks(onloadCallback);
      } 
    };
    
    getWorks(onloadCallback);
  } else {
    // filterAndSortだけ実行して表示
    var sortedImages = filterAndSort(); 
    $('.column-search-result').children('ul').empty().append(sortedImages);
  }

  // 被さって表示されてしまう要素をremove
  $('.popular-introduction').remove();
});
