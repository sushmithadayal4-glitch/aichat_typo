export const truncateText = (text, length = 40) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};