import { chineseError } from '../../utils/errors';

describe('Chinese error messages', () => {
  it.each([
    ['You have exceeded the DAILY quota for LegacyDownloads', '今日下載額度已用完，請待額度重置後再試。'],
    ['Monthly quota exceeded', '本期每月下載額度已用完，請待額度重置後再試。'],
    ['Hourly conversion limit reached. Please try again later.', '本小時的轉檔次數已達上限，請稍後再試。'],
    ['Another conversion is running. Please try again shortly.', '目前有其他影片正在轉檔，請稍後再試。'],
    ['Please use a video no longer than 10 minutes.', '請使用長度不超過 10 分鐘的影片。'],
    ['Download timeout', '處理時間過長，請稍後再試或改用較短的影片。'],
    ['The server API key is not configured.', '下載服務授權或設定有誤，請聯絡網站管理員。'],
    ['Unexpected provider diagnostics', '音訊轉換失敗，請稍後再試或改用其他影片。'],
    ['轉換失敗，請稍後再試。', '轉換失敗，請稍後再試。']
  ])('localizes %s', (message, expected) => {
    expect(chineseError(message)).toBe(expected);
  });
});
