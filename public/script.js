(function () {
  "use strict";

  const form = document.getElementById("shortenForm");
  const urlInput = document.getElementById("urlInput");
  const customCode = document.getElementById("customCode");
  const customInputWrap = document.querySelector(".custom-input-wrap");
  const hintText = document.getElementById("customCodeHint");
  const optionsToggle = document.getElementById("optionsToggle");
  const optionsPanel = document.getElementById("optionsPanel");
  const prefixLabel = document.getElementById("prefixLabel");
  const result = document.getElementById("result");
  const submitBtn = document.getElementById("submitBtn");
  const toast = document.getElementById("toast");
  const toastText = toast.querySelector(".toast-text");
  const toastIcon = toast.querySelector(".toast-icon");

  const CUSTOM_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;
  const MIN_CODE_LEN = 3;
  const MAX_CODE_LEN = 30;
  let toastTimer = null;

  prefixLabel.textContent = window.location.host + "/";

  optionsToggle.addEventListener("click", function () {
    const expanded = optionsToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      optionsPanel.setAttribute("hidden", "");
      optionsToggle.setAttribute("aria-expanded", "false");
    } else {
      optionsPanel.removeAttribute("hidden");
      const inner = optionsPanel.firstElementChild;
      if (!inner || inner.className !== "panel-inner") {
        const wrapper = document.createElement("div");
        wrapper.className = "panel-inner";
        while (optionsPanel.firstChild) {
          wrapper.appendChild(optionsPanel.firstChild);
        }
        optionsPanel.appendChild(wrapper);
      }
      optionsToggle.setAttribute("aria-expanded", "true");
      setTimeout(function () {
        customCode.focus();
      }, 200);
    }
  });

  function validateCustomCode(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { state: "idle", message: "" };
    }
    if (trimmed.length < MIN_CODE_LEN) {
      return {
        state: "error",
        message: "Too short — use at least " + MIN_CODE_LEN + " characters",
      };
    }
    if (trimmed.length > MAX_CODE_LEN) {
      return {
        state: "error",
        message: "Too long — max " + MAX_CODE_LEN + " characters",
      };
    }
    if (!CUSTOM_CODE_PATTERN.test(trimmed)) {
      return {
        state: "error",
        message: "Only letters, numbers, hyphens and underscores",
      };
    }
    return {
      state: "valid",
      message: "Looks good — " + trimmed.length + "/" + MAX_CODE_LEN,
    };
  }

  function updateCustomValidation() {
    const val = customCode.value;
    const result = validateCustomCode(val);
    customInputWrap.classList.remove("invalid", "valid");
    hintText.classList.remove("error", "success");
    if (result.state === "error") {
      customInputWrap.classList.add("invalid");
      hintText.classList.add("error");
    } else if (result.state === "valid") {
      customInputWrap.classList.add("valid");
      hintText.classList.add("success");
    }
    hintText.textContent = result.message;
    return result.state;
  }

  customCode.addEventListener("input", updateCustomValidation);

  function showToast(message, type) {
    clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.remove("error");
    if (type === "error") {
      toast.classList.add("error");
      toastIcon.textContent = "!";
    } else {
      toastIcon.textContent = "✓";
    }
    toast.classList.add("show");
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2600);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.classList.add("loading");
    } else {
      submitBtn.classList.remove("loading");
    }
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderResult(data) {
    var wrapper = document.createElement("div");
    wrapper.className = "short-url-card";
    wrapper.innerHTML =
      '<span class="result-label">Your short URL</span>' +
      '<div class="result-link-row">' +
      '<a class="result-link" href="' +
      escapeHtml(data.shortUrl) +
      '" target="_blank" rel="noopener">' +
      escapeHtml(data.shortUrl) +
      "</a>" +
      '<button class="copy-btn" type="button" aria-label="Copy short URL">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"></rect>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"></path>' +
      "</svg>" +
      '<span class="copy-label">Copy</span>' +
      "</button>" +
      "</div>";

    result.innerHTML = "";
    result.appendChild(wrapper);

    var copyBtn = wrapper.querySelector(".copy-btn");
    var copyLabel = wrapper.querySelector(".copy-label");

    copyBtn.addEventListener("click", function () {
      navigator.clipboard
        .writeText(data.shortUrl)
        .then(function () {
          copyBtn.classList.add("copied");
          copyLabel.textContent = "Copied!";
          showToast("Link copied to clipboard", "success");
          setTimeout(function () {
            copyBtn.classList.remove("copied");
            copyLabel.textContent = "Copy";
          }, 2000);
        })
        .catch(function () {
          showToast("Couldn't copy — please do it manually", "error");
        });
    });
  }

  function renderError(msg) {
    result.innerHTML =
      '<div class="error-box">' +
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>' +
      '<line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>' +
      '<line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>' +
      "</svg>" +
      '<span>' +
      escapeHtml(msg) +
      "</span>" +
      "</div>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var url = urlInput.value.trim();
    var code = customCode.value.trim();

    if (!url) {
      renderError("Please enter a URL.");
      urlInput.focus();
      return;
    }

    try {
      new URL(url);
    } catch (_err) {
      renderError("Please enter a valid URL.");
      urlInput.focus();
      return;
    }

    if (code) {
      var validation = validateCustomCode(code);
      if (validation === "error") {
        updateCustomValidation();
        renderError("Fix the custom short code issue above and try again.");
        customCode.focus();
        return;
      }
    }

    setLoading(true);
    result.innerHTML = "";

    var body = { url: url };
    if (code) {
      body.customCode = code;
    }

    fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (outcome) {
        if (!outcome.ok) {
          renderError(outcome.data.error || "Something went wrong.");
          if (outcome.data && outcome.data.error && outcome.data.error.toLowerCase().indexOf("already taken") !== -1) {
            customInputWrap.classList.add("invalid");
            hintText.classList.add("error");
            hintText.textContent = "That code is already taken — try another";
          }
          return;
        }
        renderResult(outcome.data);
        urlInput.value = "";
        customCode.value = "";
        customInputWrap.classList.remove("invalid", "valid");
        hintText.classList.remove("error", "success");
        hintText.textContent = "";
      })
      .catch(function () {
        renderError("Network error. Please try again.");
        showToast("Network error", "error");
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
