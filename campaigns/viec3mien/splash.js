// splash.js — captive portal logic (Minimized for NoDogSplash compatibility)

var banner = document.getElementById("mainBanner");
var bar = document.getElementById("progressBar");
var btnInternet = document.getElementById("btnInternet");
var btnCall = document.getElementById("btnCall");
var btnEmail = document.getElementById("btnEmail");
var statusText = document.getElementById("statusText");
var progressWrapper = document.getElementById("progressWrapper");
var redirInput = document.getElementById("redirInput");

var DURATION = 7000;

function initPortal(manifest) {
  var adFiles = manifest.banners || [];
  if (adFiles.length === 0) return;

  var selected = adFiles[Math.floor(Math.random() * adFiles.length)];
  var contact = selected.contact || {};

  if (banner) {
    banner.src = selected.dest;
    banner.style.opacity = 1;
  }

  if (redirInput) redirInput.value = contact.website;

  if (btnCall) {
    if (contact.phone) btnCall.href = "tel:" + contact.phone;
    else btnCall.style.display = "none";
  }
  if (btnEmail) {
    if (contact.email) btnEmail.href = "mailto:" + contact.email;
    else btnEmail.style.display = "none";
  }
}

function startTimer() {
  var startTime = Date.now();

  var timer = setInterval(function () {
    var percent = Math.min(((Date.now() - startTime) / DURATION) * 100, 100);
    if (bar) bar.style.width = percent + "%";

    if (percent >= 100) {
      clearInterval(timer);
      if (progressWrapper) progressWrapper.style.display = "none";
      if (statusText) {
        statusText.innerText = "Kết nối đã sẵn sàng!";
        statusText.style.color = "#28a745";
      }
      if (btnInternet) btnInternet.style.display = "inline-block";
    }
  }, 100);
}

// Fetch manifest and start UI updates
fetch("manifest.json")
  .then(function (r) { return r.json(); })
  .then(function (manifest) {
    initPortal(manifest);
    startTimer();
  })
  .catch(function(e) {
    // If JS fails, show button immediately
    if (btnInternet) btnInternet.style.display = "inline-block";
    if (progressWrapper) progressWrapper.style.display = "none";
  });
