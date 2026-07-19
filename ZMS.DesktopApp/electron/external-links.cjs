function isSafeExternalUrl(candidate) {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

module.exports = { isSafeExternalUrl };
