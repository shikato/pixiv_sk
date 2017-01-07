# pixiv_sk

shikatoがpixivを快適に使うためのユーザースクリプトです。   
pixivの検索結果をソートしたりフィルタリングしたりページに表示する作品数を増やしたりできます。   
（2012年くらいから使ってるので、ちゃんとGithubで管理することにしました）

## Demo
![gif](./sample.gif)

## Install
[greasyfork.org](https://greasyfork.org/ja/scripts/2247-pixiv-sk)からインストールしてください。 

※ユーザースクリプトをChromeで使うには[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja)が必要です。  
※Chromeでしか動作確認してません。  
※ pixiv_skを有効にすると、それぞれのサムネイル画像右下にあるメニュー（「ミュート設定」や「報告」）が表示されなくなります。 「ミュート設定」や「報告」をしたい場合はpixiv_skをoffにしてください。  
※ 他にも↑のような現象が発生するかもしれませんが、現状確認できているのは↑のみです。


## Option
コードを直接編集することにより、スクリプトの挙動を変更することができます(31行目あたり)。   
```javascript
// 1ページに何ページ分の作品を表示するか
// ex) 1なら通常通り
//     2にすると2ページ分表示
var GETTING_PAGE_COUNT = 3;
// 作品のブックマーク数が以下の値未満の場合は表示しない
var FAV_FILTER = 3;
// リンクを別のタブで開くかどうか true / false
var IS_LINK_BLANK = true; 
```

## License
MIT
