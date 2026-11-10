const config = window.wrapped;
const slides = [
  ["cover", config.cover],
  ["numbers", config.numbers],
  ["song", config.song],
  ["favorites", config.favorites],
  ["gallery", config.gallery],
  ["madeBetter", config.madeBetter],
  ["nextYear", config.nextYear],
].filter(([key, content]) => key !== "gallery" || content.enabled);

const stage = document.querySelector("#slide");
const progress = document.querySelector("#progress");
const position = document.querySelector("#position");
const back = document.querySelector("#back");
const forward = document.querySelector("#forward");
let slideIndex = 0;
let revealIndex = -1;

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function appendText(parent, className, text) {
  if (text) parent.append(element("p", className, text));
}

function appendPhoto(parent, filename, description) {
  if (!filename) return;
  const photo = element("img", "photo");
  photo.src = "photos/" + encodeURIComponent(filename);
  photo.alt = description;
  parent.append(photo);
}

function photoSlot(filename, label, code = false) {
  const slot = element("div", code ? "media-slot code-slot" : "media-slot");
  if (filename) {
    appendPhoto(slot, filename, label);
  } else {
    slot.append(element("span", "slot-label", label));
  }
  return slot;
}

function revealCount(key, content) {
  if (key === "cover") return 0;
  if (key === "favorites") return content.memories.length;
  return 1;
}

function render(moveFocus = true) {
  const [key, content] = slides[slideIndex];
  const root = document.documentElement;
  ["--background", "--ink", "--accent"].forEach((property, index) => {
    root.style.setProperty(property, content.colors[index]);
  });

  const isFront = revealIndex < 0 && key !== "cover";
  const hasCustomLayout = !isFront && ["song", "favorites", "gallery", "madeBetter", "nextYear"].includes(key);
  const panel = element("section", isFront ? "panel front" : hasCustomLayout ? "panel detail" : "panel");
  const body = element("div", "panel-body");
  const copy = element("div", "panel-copy");
  const heading = element("h1", "", content.title);
  heading.tabIndex = -1;
  const marker = key === "favorites" && revealIndex >= 0
    ? `Memory ${revealIndex + 1} / ${content.memories.length}`
    : "";
  appendText(copy, "eyebrow", marker);
  copy.append(heading);
  body.append(copy);
  panel.append(body);

  if (isFront) {
    const flip = element("button", "flip", "Click to reveal");
    flip.type = "button";
    flip.addEventListener("click", goForward);
    copy.append(flip);
  } else switch (key) {
    case "cover":
      appendText(copy, "subtitle", content.subtitle);
      appendPhoto(body, content.photo, "Anniversary cover photo");
      break;
    case "numbers": {
      const stats = element("dl", "stats");
      const rows = [
        ["Total call time", content.totalCallTime],
        ["Texts sent", content.textsSent],
        ["Longest time spent apart", content.longestApart],
        ["Longest call", content.longestCall],
      ];
      for (const [label, value] of rows) {
        const stat = element("div", "stat");
        stat.append(element("dt", "", label), element("dd", "", value));
        stats.append(stat);
      }
      copy.append(stats);
      break;
    }
    case "song": {
      const layout = element("div", "reveal-layout song-layout");
      const media = element("div", "song-media");
      media.append(
        photoSlot(content.photo, "Song photo"),
        photoSlot(content.spotifyCode, "Spotify code", true),
      );
      const writing = element("div", "writing-space");
      appendText(writing, "subtitle", content.songTitle);
      appendText(writing, "copy", content.memory);
      layout.append(media, writing);
      copy.append(layout);
      break;
    }
    case "favorites": {
      const memory = content.memories[revealIndex];
      const layout = element("div", "reveal-layout memory-layout");
      const photos = element("div", "memory-photos");
      photos.append(
        photoSlot(memory.photo, "Photo 1"),
        photoSlot(memory.secondPhoto, "Photo 2"),
      );
      layout.append(photos, element("div", "copy writing-space memory-note", memory.text));
      copy.append(layout);
      appendText(copy, "memory-footnote", content.footnote);
      break;
    }
    case "gallery": {
      const gallery = element("div", "gallery-grid");
      for (let index = 0; index < 3; index += 1) {
        const entry = content.photos[index];
        const filename = typeof entry === "string" ? entry : entry?.photo;
        const figure = element("figure", "gallery-item");
        figure.append(
          photoSlot(filename, `Photo ${index + 1}`),
          element("figcaption", "caption", entry?.caption ?? ""),
        );
        gallery.append(figure);
      }
      copy.append(gallery);
      break;
    }
    case "madeBetter":
      copy.append(element("div", "copy writing-space teaser", content.note));
      break;
    case "nextYear":
      appendText(copy, "subtitle", content.subtitle);
      copy.append(element("div", "copy writing-space teaser", content.idea));
      break;
  }

  stage.replaceChildren(panel);
  progress.replaceChildren(...slides.map((_, index) => element("span",
    index === slideIndex ? "segment current" : index < slideIndex ? "segment complete" : "segment")));
  progress.setAttribute("aria-valuemin", "1");
  progress.setAttribute("aria-valuemax", slides.length);
  progress.setAttribute("aria-valuenow", slideIndex + 1);
  position.textContent = `${slideIndex + 1} / ${slides.length}`;

  back.disabled = slideIndex === 0;
  const hasReveal = revealIndex + 1 < revealCount(key, content);
  forward.textContent = key === "cover" ? "Start →"
    : isFront ? "Reveal →"
    : key === "nextYear" ? "↻ Replay"
    : hasReveal && key === "favorites" ? `Reveal memory ${revealIndex + 2} →`
    : "Next →";
  if (moveFocus) heading.focus();
}

function goForward() {
  const [key, content] = slides[slideIndex];
  if (revealIndex + 1 < revealCount(key, content)) {
    revealIndex += 1;
  } else {
    slideIndex = (slideIndex + 1) % slides.length;
    revealIndex = -1;
  }
  render();
}

function goBack() {
  if (revealIndex >= 0) {
    revealIndex -= 1;
  } else if (slideIndex > 0) {
    slideIndex -= 1;
    const [previousKey, previousContent] = slides[slideIndex];
    revealIndex = revealCount(previousKey, previousContent) - 1;
  } else {
    return;
  }
  render();
}

forward.addEventListener("click", goForward);
back.addEventListener("click", goBack);
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
  if (event.key === "ArrowRight" && (slideIndex < slides.length - 1 || revealIndex < 0)) {
    event.preventDefault();
    goForward();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    goBack();
  }
});
render(false);
