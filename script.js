
// SELECT HTML ELEMENTS

const form = document.getElementById("shorten-form");
const input = document.getElementById("url-input");
const errorMessage = document.getElementById("error-message");
const linkList = document.getElementById("link-list");

// LOCAL STORAGE

let links = JSON.parse(localStorage.getItem("shortly-links")) || [];

// URL VALIDATION

function validateURL(value) {

    let url = value.trim();

    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    try {
        const parsedURL = new URL(url);

        if (!parsedURL.hostname.includes(".")) {
            return null;
        }

        return parsedURL.href;

    } catch {
        return null;
    }
}

// SHOW ERROR

function showError(message) {

    errorMessage.textContent = message;

    input.style.border = "2px solid red";
}

// CLEAR ERROR

function clearError() {

    errorMessage.textContent = "";

    input.style.border = "none";
}

// DISPLAY SHORTENED LINKS

function displayLinks() {

    linkList.innerHTML = "";

    links.forEach((item) => {

        const div = document.createElement("div");

        div.className = "link-item";

        const original = document.createElement("span");

        original.className = "original-url";
        original.textContent = item.original;

        const short = document.createElement("a");

        short.className = "short-url";
        short.href = item.short;
        short.target = "_blank";
        short.rel = "noopener noreferrer";
        short.textContent = item.short;

        const copyButton = document.createElement("button");

        copyButton.className = "copy-button";
        copyButton.textContent = "Copy";

        // COPY BUTTON FUNCTION

        copyButton.addEventListener("click", async () => {

            try {

                await navigator.clipboard.writeText(item.short);

                copyButton.textContent = "Copied!";
                copyButton.classList.add("copied");

            } catch {

                copyButton.textContent = "Copy failed";

            }

            setTimeout(() => {

                copyButton.textContent = "Copy";
                copyButton.classList.remove("copied");

            }, 2000);

        });

        div.appendChild(original);
        div.appendChild(short);
        div.appendChild(copyButton);

        linkList.appendChild(div);

    });

}

// SHORTEN URL FUNCTION

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    clearError();

    const originalURL = validateURL(input.value);

    if (input.value.trim() === "") {

        showError("Please add a link");

        return;
    }

    if (!originalURL) {

        showError("Please enter a valid URL");

        return;
    }

    const button = form.querySelector("button");

    button.disabled = true;
    button.textContent = "Shortening...";

    try {

        const response = await fetch(
            "https://cleanuri.com/api/v1/shorten",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    url: originalURL
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.result_url) {

            throw new Error(
                data.error || "Unable to shorten URL"
            );

        }

        // SAVE LINK

        links.unshift({

            original: originalURL,

            short: data.result_url

        });

        localStorage.setItem(
            "shortly-links",
            JSON.stringify(links)
        );

        // DISPLAY LINK

        displayLinks();

        input.value = "";

    } catch(error) {

        showError(
            error.message || "Something went wrong"
        );

    } finally {

        button.disabled = false;

        button.textContent = "Shorten It!";

    }

});

// REMOVE ERROR WHILE TYPING

input.addEventListener("input", clearError);

// DISPLAY SAVED LINKS WHEN PAGE LOADS

displayLinks();
