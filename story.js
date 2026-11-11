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
  photo.src = "photos/" + filename.split("/").map(encodeURIComponent).join("/");
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
  if (key === "nextYear") panel.classList.add("next-year-panel");
  if (key === "madeBetter") panel.classList.add("sleep-panel");
  if (key === "favorites" && !isFront) panel.classList.add("memory-panel");
  const body = element("div", "panel-body");
  const copy = element("div", "panel-copy");
  let title = content.title;
  if (!isFront && key === "favorites") title = content.memories[revealIndex].title || title;
  if (!isFront && key === "madeBetter") title = content.revealTitle || title;
  const heading = element("h1", key === "nextYear" ? "next-year-heading" : "", title);
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
        ["Average texts per day", content.averageTextsPerDay],
      ];
      if (content.longestCall) rows.push(["Longest call", content.longestCall]);
      for (const [label, value] of rows) {
        const stat = element("div", "stat");
        const result = element("dd", "stat-value");
        if (value) {
          const reveal = element("button", "stat-reveal", "Reveal");
          reveal.type = "button";
          reveal.setAttribute("aria-label", `Reveal ${label.toLowerCase()}`);
          reveal.addEventListener("click", () => {
            result.textContent = value;
            result.tabIndex = -1;
            result.focus();
          });
          result.append(reveal);
        }
        stat.append(element("dt", "", label), result);
        stats.append(stat);
      }
      copy.append(stats);
      break;
    }
    case "song": {
      const layout = element("div", "song-feature");
      const screen = element("div", "song-screen");
      if (content.video) {
        const video = element("video", "song-video");
        video.src = "photos/" + encodeURIComponent(content.video);
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("aria-label", "Movie for That One Song");
        screen.append(video);
      }
      const details = element("div", "song-details");
      const album = element("div", "song-album");
      const frame = element("div", "song-frame");
      frame.append(
        photoSlot(content.photo, "Album cover"),
        photoSlot(content.spotifyCode, "Spotify code", true),
      );
      album.append(frame);
      const side = element("div", "song-side");
      if (content.sidePhoto) side.append(photoSlot(content.sidePhoto, "James car photo"));
      appendText(side, "song-track", content.songTitle);
      album.append(side);
      details.append(album, element("div", "copy writing-space song-note", content.memory));
      layout.append(screen, details);
      copy.append(layout);
      break;
    }
    case "favorites": {
      const memory = content.memories[revealIndex];
      const layouts = ["festive", "skip", "april"];
      const photos = element("div", "memory-showcase " + (layouts[revealIndex] ?? ""));
      const names = memory.photos ?? [memory.photo, memory.secondPhoto].filter(Boolean);
      for (const [index, name] of names.entries()) {
        const filename = memory.folder ? memory.folder + "/" + name : name;
        photos.append(photoSlot(filename, (memory.title || content.title) + ", photo " + (index + 1)));
      }
      copy.append(photos);
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
    case "madeBetter": {
      const reveal = element("div", "sleep-reveal");
      reveal.append(heading, element("div", "copy writing-space", content.note));
      copy.append(reveal);
      break;
    }
    case "nextYear": {
      const web = element("div", "plans-web");
      const links = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      links.setAttribute("viewBox", "0 0 100 100");
      links.setAttribute("preserveAspectRatio", "none");
      links.setAttribute("aria-hidden", "true");
      const heart = element("span", "plans-heart", "♥");
      heart.setAttribute("aria-hidden", "true");
      const plans = element("ul", "next-plans");
      plans.setAttribute("role", "list");
      const positions = [
        [24, 9], [50, 9], [76, 9], [88, 25], [89, 43], [89, 62], [86, 80],
        [74, 92], [50, 92], [25, 92], [12, 74], [11, 53], [12, 31],
      ];
      for (const [index, plan] of content.plans.entries()) {
        const [x, y] = positions[index];
        const item = element("li", "next-plan", plan);
        item.style.setProperty("--plan-x", x + "%");
        item.style.setProperty("--plan-y", y + "%");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "50");
        line.setAttribute("y1", "50");
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("vector-effect", "non-scaling-stroke");
        links.append(line);
        plans.append(item);
      }
      web.append(links, heart, plans);
      copy.append(web);
      break;
    }
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
