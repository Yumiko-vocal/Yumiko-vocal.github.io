const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

fetch(csvUrl)
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.trim().split('\n');
    const container = document.getElementById('next_schedule');
    const headers = rows[0].split(',');

    const today = new Date();
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

    // ポスターがあれば掲載する
    const posterImg = data['ポスターのリンク']
      ? `<img src="${data['ポスターのリンク']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
      : '';

    // コメント欄をフォーマットする
    const formattedComment = data['コメント']?.replace(/(\r\n|\n|\r)/g, '<br />') ?? '';

    const html = `
      <p class="highlight-background">
        ${posterImg}
        <span style="font-size:18px"><strong>${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${weekday}）${data['開始時間']}～</strong></span><br />
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
