export async function urlImageToBase64(url: string): Promise<string> {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`图片请求失败：${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Base64解析失败'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
