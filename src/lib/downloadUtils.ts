export const downloadAsMd = (filename: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/markdown' });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.md`;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};
