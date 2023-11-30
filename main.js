function parseMarkdown(text) {
  // Regex function to parse out markdown in my channel
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

window.onload = async function () {
  const CHANNEL_ID = "library-_m__nu7eeiw";
  const API_KEY = import.meta.env.VITE_ARENA_API_KEY;
  const ARENA_API_CHANNEL_URL = `https://api.are.na/v2/channels/${CHANNEL_ID}`;
  const ARENA_API_CONTENT_URL = `https://api.are.na/v2/channels/${CHANNEL_ID}/contents?&per=100&sort=position&direction=desc&page=`;

  const blockSpace = document.getElementById("blockspace");
  const template = document.getElementById("bookTemplate");

  async function fetchChannelData() {
    const response = await fetch(ARENA_API_CHANNEL_URL, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch channel data: ${response.statusText}`);
      return null;
    }
    // console.log(response.json());
    return await response.json();
  }

  async function fetchBooksPage(page) {
    try {
      const response = await fetch(`${ARENA_API_CONTENT_URL}${page}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });
      if (!response.ok) {
        console.error(`Failed to fetch page ${page}: ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching page ${page}: ${error}`);
    }
  }

  const channelData = await fetchChannelData();
  if (!channelData || !Array.isArray(channelData.contents)) {
    console.error(
      "Failed to fetch the channel data or data format is incorrect"
    );
    return;
  }

  const totalPages = Math.ceil(channelData.contents.length / 100);
  console.log(`Total pages: ${totalPages}`);

  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    const pageData = await fetchBooksPage(currentPage);
    if (!pageData) {
      console.error(`Failed to fetch page ${currentPage}`);
      continue;
    }

    pageData.contents.forEach((item) => {
      if (item.class === "Attachment") {
        const clone = document.importNode(template.content, true);
        clone.querySelector(".book-link").href = item.attachment.url;
        clone.querySelector(".picture").src = item.image.original.url;
        clone.querySelector(".book-title").textContent = item.title || "";
        clone.querySelector(".book-description").textContent =
          item.description || "";

        blockSpace.appendChild(clone);
      }

      if (item.class === "Image") {
        const clone = document.importNode(template.content, true);
        clone.querySelector(".picture").src = item.image.original.url;
        clone.querySelector(".book-title").textContent = item.title || "";
        clone.querySelector(".book-description").textContent =
          item.description || "";

        blockSpace.appendChild(clone);
      }

      if (item.class === "Text") {
        const year = document.createElement("div");
        year.classList.add("year-text");
        year.textContent = parseMarkdown(item.content);
        blockSpace.appendChild(year);
      }
    });

    // Apply the animation effect
    let delay = 500;
    Array.from(blockSpace.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        setTimeout(() => {
          child.classList.add("visible");
        }, delay);
        delay += 50;
      }
    });
  }
};
