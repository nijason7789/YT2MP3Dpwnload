/** Translate backend/provider errors without displaying raw service diagnostics. */
export const chineseError = (message?: string): string => {
  if (!message) return '轉換失敗，請稍後再試。';
  if (/exceeded.*daily.*quota|daily.*quota.*exceeded/i.test(message)) return '今日下載額度已用完，請待額度重置後再試。';
  if (/exceeded.*monthly.*quota|monthly.*quota.*exceeded/i.test(message)) return '本期每月下載額度已用完，請待額度重置後再試。';
  if (/quota.*exceeded|exceeded.*quota/i.test(message)) return '下載服務額度已用完，請待額度重置後再試。';
  if (/hourly conversion limit/i.test(message)) return '本小時的轉檔次數已達上限，請稍後再試。';
  if (/another conversion is running/i.test(message)) return '目前有其他影片正在轉檔，請稍後再試。';
  if (/no longer than 10 minutes/i.test(message)) return '請使用長度不超過 10 分鐘的影片。';
  if (/too large/i.test(message)) return '檔案過大，請改用較短的影片。';
  if (/invalid youtube/i.test(message)) return '請輸入有效的 YouTube 影片網址';
  if (/live streams/i.test(message)) return '目前不支援直播影片，請改用已上傳的影片。';
  if (/duration/i.test(message)) return '無法確認影片長度，請改用其他影片。';
  if (/not configured|api key|not subscribed|access denied|unauthorized/i.test(message)) return '下載服務授權或設定有誤，請聯絡網站管理員。';
  if (/website is not allowed/i.test(message)) return '下載服務尚未允許此網站存取，請聯絡網站管理員。';
  if (/timed? ?out|timeout|aborted/i.test(message)) return '處理時間過長，請稍後再試或改用較短的影片。';
  if (/rate limit|too many requests/i.test(message)) return '請求過於頻繁，請稍後再試。';
  if (/mega plan|mp3 is available/i.test(message)) return '下載服務的目前方案不支援此格式，請聯絡網站管理員。';
  if (/private|unavailable|not found|removed/i.test(message)) return '影片無法存取，可能已下架或設為私人影片，請改用其他影片。';
  if (/blocked this server/i.test(message)) return 'YouTube 暫時阻擋了下載服務，請稍後再試。';
  if (/[\u3400-\u9fff]/.test(message)) return message;
  return '音訊轉換失敗，請稍後再試或改用其他影片。';
};
