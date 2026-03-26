export const copyTextToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(true);
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => resolve(true),
      (err) => reject(err)
    );
  });
};