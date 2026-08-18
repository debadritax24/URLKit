(function () {
  "use strict";

  const form = document.getElementById("shortenForm");
  const input = document.getElementById("urlInput");
  const result = document.getElementById("result");
  const submitBtn = document.getElementById("submitBtn");

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2000);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Shortening..." : "Shorten";
  }

  function renderResult(data) {
    result.innerHTML =
      '<div class="short-url">' +
      '<a href="' + data.shortUrl + '" target="_blank" rel="noopener">' + data.shortUrl + "</a>" +
      '<button class="copy-btn" type="button">Copy</button>' +
      "</div>";

    result.querySelector(".copy-btn").addEventListener("click", function () {
      navigator.clipboard.writeText(data.shortUrl).then(function () {
        showToast("Copied to clipboard");
      });
    });
  }

  function renderError(msg) {
    result.innerHTML = '<p class="error-msg">' + msg + "</p>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var url = input.value.trim();

    if (!url) {
      renderError("Please enter a URL.");
      return;
    }

    try {
      new URL(url);
    } catch {
      renderError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    result.innerHTML = "";

    fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (outcome) {
        if (!outcome.ok) {
          renderError(outcome.data.error || "Something went wrong.");
          return;
        }
        renderResult(outcome.data);
        input.value = "";
      })
      .catch(function () {
        renderError("Network error. Please try again.");
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
