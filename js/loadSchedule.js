// スプレッドシートリンク
// https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/edit?usp=sharing
const csvUrl = 'https://docs.google.com/spreadsheets/d/1tq8_E9vKwo13pYOELAnFkN4LKt6mHzc3gGe8gveq_kk/export?format=csv';

// CSVを読み込み
fetch(csvUrl)
  .then(response => response.text())  // CSVとして読み込み
  .then(csvData => {
    const rows = csvData.split('\n');  // 改行で分割して行ごとに
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
      const mCharge = Number(data['Mチャージ'])?.toLocaleString?.() ?? '';

      // ポスターがあれば掲載する
      const posterImg = data['ポスター']
        ? `<img src="${data['ポスター']}" alt="poster" class="zoomable" style="float:right;width:120px;height:auto">`
        : '';

      // 必要なデータをHTMLとして追加
      const html = `
        <p class="highlight-background">
          ${posterImg}
          <span style="font-size:18px"><strong>${month}月${day}日（${weekday}）${data['開始時間']}～</strong></span><br />
          ${data['場所']}　　<a href="${data['リンク']}" target="_blank"><strong>詳細はこちら</strong></a><br />
          ${data['出演者']}<br />
          M.チャージ  ¥${mCharge}<br />
          ${data['コメント']}<br />
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
