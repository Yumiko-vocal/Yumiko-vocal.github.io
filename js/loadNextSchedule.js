const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

fetch(csvUrl)
  .then(response => response.text())
  .then(csvData => {
    // "\n"を無視して\nで行を取得する
    const rows = processCSV(csvData)
    const container = document.getElementById('next_schedule');
    const headers = rows[0].split(',');

    const today = new Date();
    today.setHours(0, 0, 0, 0);  // 時分秒をリセット
    const events = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (row.length !== headers.length) continue;

      const data = {};
      for (let j = 0; j < headers.length; j++) {
        data[headers[j]] = row[j];
      }

      const year = parseInt(data['年']);
      const month = parseInt(data['月']);
      const day = parseInt(data['日']);

      const eventDate = new Date(year, month - 1, day);
      if (isNaN(eventDate)) continue;

      if (eventDate >= today) {
        events.push({ data, eventDate });
      }
    }

    if (events.length === 0) {
      container.innerHTML = "<p>次回の予定は現在ありません。</p>";
      return;
    }

    // 日付で昇順ソート
    events.sort((a, b) => a.eventDate - b.eventDate);

    // 最も近い1件のみ
    const { data, eventDate } = events[0];
    const weekday = getWeekday(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate());
    const mCharge = Number(data['Mチャージ（自動入力）'])?.toLocaleString?.() ?? '';

    // 当日であった場合のコメント判定
    let extraComment = ''; // とりあえず空定義
    let highlightClass = 'highlight-background'; // 通常背景
    if (eventDate.getTime()===today.getTime()){
      extraComment = 'Live Jazz Tonight – Don’t Miss It!<br />';
      highlightClass = 'highlight-background2';
    }

    // ポスターがあれば掲載する
    const posterImg = data['ポスターのリンク']
      ? `<img src="${data['ポスターのリンク']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
      //: '';
      // なければダミー画像を表示
      : '<img src="/img/poster-dummy-img.jpg" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">';

    // コメント欄をフォーマットする
    const formattedComment = data['コメント']?.replace(/(\r\n|\n|\r)/g, '<br />') ?? '';

    const html = `
      <p class="${highlightClass}">
        <div style="text-align: center;"><Strong>${extraComment}</Strong></div>
        ${posterImg}
        <span style="font-size:18px"><strong>${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${weekday}）${data['開始時間']}～</strong></span><br />
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

    container.insertAdjacentHTML('beforeend', html);
  })
  .catch(error => console.error('Error:', error));

// 曜日取得
function getWeekday(year, month, day) {
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
