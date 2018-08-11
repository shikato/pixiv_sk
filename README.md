# pixiv_sk

shikatoがpixivを快適に使うためのユーザースクリプトです。   
pixivの検索結果をフィルタリングしてソートします。    
（2012年くらいから使っているので、Githubで管理することにしました）

## Demo
![gif](./sample.gif)

## Install
[greasyfork.org](https://greasyfork.org/ja/scripts/2247-pixiv-sk)からインストールしてください。 

※ユーザースクリプトをChromeで使うには[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)が必要です。  
※Chromeでしか動作確認してません。  

## Usage
**2018-08-11 追記**   
pixiv.netの変更により、pixiv_skのフィルタリング機能とソート機能が動作するためには、下記条件を満たすことが必要となりました。

* 対象作品のサムネイル画像読み込みが完了している
    - 対象作品のサムネイル画像読み込みが開始されるためには、対象作品のサムネイル画像表示領域が画面内に収まっている必要があります。よって必要に応じてブラウザのスクロール操作が必要となります。



## Option
コードを直接編集することにより、スクリプトの挙動を変更することができます(13行目あたり)。   
```javascript
// 作品のブックマーク数が以下の値未満の場合は表示しない
var FAV_FILTER = 3;
// リンクを別のタブで開くかどうか true / false
var IS_LINK_BLANK = true; 
```

## License
MIT
