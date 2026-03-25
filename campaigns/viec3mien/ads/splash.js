// splash.js — simple captive portal logic

var banner = document.getElementById("mainBanner");
var bar = document.getElementById("progressBar");
var btnInternet = document.getElementById("btnInternet");
var btnCall = document.getElementById("btnCall");
var btnEmail = document.getElementById("btnEmail");
var statusText = document.getElementById("statusText");
var progressWrapper = document.getElementById("progressWrapper");
var redirInput = document.getElementById("redirInput");
var authForm = document.getElementById("authenticatedFrm");

// 1. Fetch local manifest and initialize
fetch('manifest.json')
    .then(function(res) { return res.json(); })
    .then(function(manifest) {
        // Find ad images
        var adFiles = manifest.banners || [];
        if (adFiles.length === 0) return;

        // Pick random ad
        var selected = adFiles[Math.floor(Math.random() * adFiles.length)];
        var contact = selected.contact || {};

        // Set image and reveal
        banner.onload = function() { banner.style.opacity = 1; };
        banner.src = selected.dest;

        // Set the redirect URL immediately (seamless)
        var targetUrl = contact.website || "https://google.com";
        redirInput.value = targetUrl;

        // Setup Call button
        if (btnCall) {
            if (contact.phone) {
                btnCall.href = "tel:" + contact.phone;
            } else {
                btnCall.style.display = "none";
            }
        }

        // Setup Email button
        if (btnEmail) {
            if (contact.email) {
                btnEmail.href = "mailto:" + contact.email;
            } else {
                btnEmail.style.display = "none";
            }
        }

        // Internet button click simply submits the form
        btnInternet.onclick = function() {
            this.innerText = "Đang kết nối...";
            this.style.opacity = "0.7";
            authForm.submit();
        };
    })
    .catch(function(err) {
        console.error("Failed to load manifest:", err);
        // Fallback: allow internet access anyway
        btnInternet.onclick = function() { authForm.submit(); };
    });

// 2. Progress bar timer
var DURATION = 7000;
var startTime = Date.now();

var timer = setInterval(function() {
    var percent = Math.min((Date.now() - startTime) / DURATION * 100, 100);
    bar.style.width = percent + "%";

    if (percent >= 100) {
        clearInterval(timer);
        progressWrapper.style.display = "none";
        statusText.innerText = "Kết nối đã sẵn sàng!";
        statusText.style.color = "#28a745";
        btnInternet.style.display = "inline-block";
    }
}, 30);
