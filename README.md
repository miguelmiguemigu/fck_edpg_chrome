[
  "copy",
  "cut",
  "paste",
  "keydown",
  "keyup",
  "beforecopy" // legacy / IE-style, still checked by some sites
].forEach(e =>
  document.addEventListener(
    e,
    ev => console.log("CLIPBOARD EVENT:", e, ev),
    true
  )
);
