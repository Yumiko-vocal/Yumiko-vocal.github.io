// スプレッドシートリンク
// https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/edit?usp=sharing
const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

// CSVを読み込み
fetch(csvUrl)
  .then(response => response.text())  // CSVとして読み込み
  .then(csvData => {
    const rows = processCSV(csvData) // "\n"を無視して\nで行を取得する
    const container = document.getElementById('schedule');  // 表示する場所

    // ヘッダー（カラム名）を取得
    const headers = rows[0].split(',');  // 最初の行をカンマで分割

    // 2行目以降（データ部分）を処理
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');  // 行ごとにカンマで分割
      if (row.length !== headers.length) continue;  // 不正な行をスキップ

      // 各列のデータを取得
      const data = {};
      for (let j = 0; j < headers.length; j++) {
        data[headers[j]] = row[j];
      }
      // 日付と曜日を取得
      const year = data['年'];
      const month = data['月'];
      const day = data['日'];
      const weekday = getWeekday(year, month, day);

      // チャージの3桁カンマ
      const mCharge = Number(data['Mチャージ（自動入力）'])?.toLocaleString?.() ?? '';

      // ポスターがあれば掲載する
      const posterImg = data['ポスターのリンク']
        ? `<img src="${data['ポスターのリンク']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
        : '';

      // コメント欄をフォーマットする
      const formattedComment = data['コメント']?.replace(/(\r\n|\n|\r)/g, '<br />') ?? '';
  
      // 必要なデータをHTMLとして追加
      const html = `
        <p class="highlight-background">
          ${posterImg}
          <span style="font-size:18px"><strong>${month}月${day}日（${weekday}）${data['開始時間']}～</strong></span><br />
          ${data['場所']}　　<a href="${data['リンク（自動入力）']}" target="_blank"><strong>詳細はこちら</strong></a><br />
          ${data['出演者']}<br />
          M.チャージ  ¥${mCharge}<br />
          <br />
          ${formattedComment}<br />
        </p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      `;

      // 生成したHTMLを指定した場所に追加
      container.insertAdjacentHTML('beforeend', html);
    }
  })
  .catch(error => console.error('Error:', error));  // エラーハンドリング


// 曜日取得する関数
function getWeekday(year, month, day) {
  // 月は0から始まるので、-1することに注意（1月=0, 12月=11）
  const date = new Date(year, month - 1, day);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekdays[date.getDay()];
}


// ダブルクオテーションで囲われた\nを回避してrowを撮る関数
function processCSV(csvData) {
  let processedData = '';
  let inQuotes = false;

  // 一文字ずつ処理
  for (let i = 0; i < csvData.length; i++) {
    const char = csvData[i];
    // ダブルクォーテーションで囲まれている場合
    if (char === '"' && (i === 0 || csvData[i - 1] !== '"')) {
      inQuotes = !inQuotes;
    }
    // 引用符の中に改行があれば XIGYO に置き換え
    if (char === '\n' && inQuotes) { processedData += ' XIgYO0 ';
    } else { processedData += char;
    }
  }
  
  // 改行で分割
  const rows = processedData.split('\n');
  // 最後に XIGYO を改行に戻し"を削除する
  const result = rows.map(row => row.replace(/ XIgYO0 /g, '\n').replace(/"/g,''));
  return result;
}
