const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

fetch(csvUrl)
  .then(res => res.text())
  .then(csvText => {
    const rawLines = csvText.split('\n');
    const rows = [];
    let line = '', quotes = 0;

    for (const l of rawLines) {
      line += (line ? '\n' : '') + l;
      quotes += (l.match(/"/g) || []).length;
      if (quotes % 2 === 0) {
        rows.push(line);
        line = ''; quotes = 0;
      }
    }

    const headers = parseCSVRow(rows[0]);
    const today = new Date();
    const events = [];

    for (let i = 1; i < rows.length; i++) {
      const values = parseCSVRow(rows[i]);
      if (values.length !== headers.length) continue;

      const data = {};
      headers.forEach((h, j) => data[h] = values[j]);
      const date = new Date(+data['年'], +data['月'] - 1, +data['日']);
      if (!isNaN(date) && date >= today) {
        events.push({ data, date }); // 修正: "eventDate" -> "date"
      }
    }

    if (events.length === 0) {
      container.innerHTML = "<p>次回の予定は現在ありません。</p>";
      return;
    }

    // 日付で昇順ソート
    events.sort((a, b) => a.date - b.date); // 修正: "eventDate" -> "date"

    // 最も近い1件のみ
    const { data, date: eventDate } = events[0]; // 修正: "eventDate" のリネーム
    const weekday = getWeekday(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate());
    const mCharge = Number(data['Mチャージ（自動入力）'])?.toLocaleString?.() ?? '';

    // ポスターがあれば掲載する
    const posterImg = data['ポスターのリンク']
      ? `<img src="${data['ポスターのリンク']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
      : '';

    // コメント欄をフォーマットする
    const formattedComment = data['コメント']?.replace(/(\r\n|\n|\r)/g, '<br />') ?? '';

    const html = `
      <p class="highlight-background">
        ${posterImg}
        <span style="font-size:18px"><strong>${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${weekday}）${data['開始時間']}～</strong></span><br />
        ${data['場所']}　　<a href="${data['リンク（自動入力）']}" target="_blank"><strong>詳細はこちら</strong></a><br />
        ${data['出演者']}<br />
        M.チャージ  ¥${mCharge}<br />
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

// CSVの1行をパース（カンマ・改行・ダブルクォート対応）
function parseCSVRow(row) {
  const result = [];
  let value = '', inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i], next = row[i + 1];
    if (char === '"' && inQuotes && next === '"') { value += '"'; i++; }
    else if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(value); value = ''; }
    else value += char;
  }
  result.push(value);
  return result;
}
