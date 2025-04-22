// スプレッドシートリンク
// https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/edit?usp=sharing
const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

// CSVを読み込み
fetch(csvUrl)
  .then(response => response.text())
  .then(csvData => {
    // "\n"を無視して、カンマ区切りで正しく行を取得する処理を関数で行う
    const rows = processCSV(csvData);  // processCSV関数でデータ処理を行う
    const container = document.getElementById('schedule');  // 表示先のHTML要素を取得
    const headers = rows[0].split(',');  // 最初の行（ヘッダー）をカンマで分割して取得

    const events = [];  // イベント情報を格納する配列

    // 2行目以降のデータを処理
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');  // 行ごとにカンマで分割
      if (row.length !== headers.length) continue;  // ヘッダーと列数が一致しない行はスキップ

      const data = {};  // 行のデータを格納するオブジェクト
      // ヘッダーとデータを対応させてオブジェクトに格納
      for (let j = 0; j < headers.length; j++) {
        data[headers[j]] = row[j];
      }

      // 年、月、日を取り出して日付オブジェクトを作成
      const year = parseInt(data['年']);
      const month = parseInt(data['月']);
      const day = parseInt(data['日']);

      // 新しい日付オブジェクトを作成
      const eventDate = new Date(year, month - 1, day);
      if (isNaN(eventDate)) continue;  // 無効な日付の場合はスキップ

      // イベント情報を格納
      events.push({ data, eventDate });
    }

    // 日付順にイベントを昇順でソート
    events.sort((a, b) => a.eventDate - b.eventDate);

    // イベントを全て表示するために、ソート後に順番にHTMLを挿入
    let eventHtml = '';
    events.forEach(event => {
      const { data, eventDate } = event;
      const weekday = getWeekday(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate());
      const mCharge = Number(data['Mチャージ（自動入力）'])?.toLocaleString?.() ?? '';

      // ポスターがあれば掲載する
      const posterImg = data['ポスターのリンク']
        ? `<img src="${data['ポスターのリンク']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
        : '';

      // コメント欄をフォーマットする
      const formattedComment = data['コメント']?.replace(/(\r\n|\n|\r)/g, '<br />') ?? '';

      // 各イベントをHTML形式で作成
      eventHtml += `
        <p class="highlight-background">
          ${posterImg}
          <span style="font-size:18px"><strong>${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${weekday}）${data['開始時間']}～</strong></span><br />
          ${data['場所']}　　${data['電話番号（自動入力）']}<br />
          <a href="${data['リンク（自動入力）']}" target="_blank"><strong>詳細はこちら</strong></a><br />
          ${data['出演者']}<br />
          M.チャージ  ¥${mCharge}<br />
          <br />
          ${formattedComment}<br />
        </p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      `;
    });

    // 作成したHTMLを挿入
    container.innerHTML = eventHtml;
  })
  .catch(error => console.error('Error:', error));


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
