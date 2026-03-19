// splash.js — captive portal logic
// Depends on: router_config.js (ROUTER_ID), ads_data.js (ads[])

// Pick a random banner from the active list
var selected = ads[Math.floor(Math.random() * ads.length)];

// Set banner image — fade in only after image is actually loaded
var banner = document.getElementById("mainBanner");
banner.onload = function() { banner.style.opacity = 1; };
banner.src = selected.image;

// Build redirect URL with UTM tracking
var separator = selected.url.indexOf("?") !== -1 ? "&" : "?";
var finalUrl = selected.url + separator +
    "utm_source=wifi&utm_medium=captive_portal" +
    "&utm_campaign=" + ROUTER_ID +
    "&utm_content=" + selected.name;

document.getElementById("redirInput").value = finalUrl;

// Progress bar + reveal button
var DURATION = 7000;
var startTime = Date.now();
var bar = document.getElementById("progressBar");
var btnInternet = document.getElementById("btnInternet");
var statusText = document.getElementById("statusText");
var progressWrapper = document.getElementById("progressWrapper");

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

// Submit auth form on button click
btnInternet.onclick = function() {
    this.innerText = "Đang kết nối...";
    this.style.opacity = "0.7";
    document.getElementById("authenticatedFrm").submit();
};
