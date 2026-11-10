# Us, Wrapped

Open `index.html` in your desktop browser. Keep the site files together. There is no install or build step. Click Start, then click each section’s title card to reveal its contents. Use the bottom buttons or your left and right arrow keys to move through the story. Click Replay at the end.

## Customize

- Open `content.js` in a text editor. Fill in the quoted blanks for your writing and stats.
- Copy photos into `photos/`. Enter each photo's filename, including its extension, in the matching field in `content.js`. Match uppercase and lowercase exactly.
- For the optional gallery, fill the three `photo` and `caption` pairs in `gallery.photos`. Set `gallery.enabled` to `false` to skip the whole slide.
- For the song, put the Spotify code image in `photos/` and enter its filename under `song.spotifyCode`. Add both memory images under `photo` and `secondPhoto` in each favorite memory.
- Each slide has a `colors` array in the order background, text, and accent. Edit any of the three hex codes to change that slide's palette.
- Save the file and refresh your browser to preview your changes.

## Publish on GitHub Pages

On GitHub Free, publish from a public repository. Anyone can open the site without an account. Anyone can also read the repository, including content behind click-to-reveal controls, and download photos directly. Sharing the link with one person does not limit access. Put only photos and text you are comfortable making public in the repository. Files removed later can remain in public commit history.

1. Sign in to GitHub as `rudeyy1` and create a public repository, for example `us-wrapped`.
2. Commit `index.html`, `style.css`, `content.js`, `story.js`, `.nojekyll` and your `photos/` folder at the repository root on `main`. If you're uploading through the website, unzip the archive first and upload the files inside it.
3. Open **Settings → Pages**. Choose **Deploy from a branch**, select **main** and **/(root)**, then click **Save**.
4. When GitHub finishes publishing, use **Visit site** to verify the result. With the example repository name, the default URL is `https://rudeyy1.github.io/us-wrapped/`.

[GitHub Pages publishing documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
