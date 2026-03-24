// splash.js — dynamic captive portal logic

// 1. Get NoDogSplash MAC from URL (e.g., ?mac=00:11:22:33:44:55)
function getQueryParam(param) {
    var searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

// 2. Track interaction by sending POST to the local router CGI
function trackInteraction(action, adId) {
    var mac = window.CLIENT_MAC || getQueryParam("clientmac") || getQueryParam("mac");
    if (!mac || mac === "$clientmac") return Promise.resolve(); // Can't track without MAC

    // NoDogSplash serves the splash page on port 2050 (typically).
    // The CGI script is served by OpenWrt's main web server (uhttpd) on port 80.
    // We use window.location.hostname to dynamically get the router's IP (e.g. 192.168.1.1).
    var cgiUrl = "http://" + window.location.hostname + "/cgi-bin/portal";

    return fetch(cgiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: mac, action: action, ad_id: adId })
    }).catch(function(err) {
        console.error("Tracking failed:", err);
    });
}

// 3. Setup UI
var banner = document.getElementById("mainBanner");
var bar = document.getElementById("progressBar");
var btnInternet = document.getElementById("btnInternet");
var btnCall = document.getElementById("btnCall");
var btnEmail = document.getElementById("btnEmail");
var statusText = document.getElementById("statusText");
var progressWrapper = document.getElementById("progressWrapper");

// 4. Fetch local manifest and initialize
fetch('manifest.json')
    .then(function(res) { return res.json(); })
    .then(function(manifest) {
        // Find ad images
        var adFiles = manifest.files.filter(function(f) { return f.path.indexOf('images/') === 0; });
        if (adFiles.length === 0) return;

        // Pick random ad
        var selected = adFiles[Math.floor(Math.random() * adFiles.length)];

        // Set image and reveal
        banner.onload = function() { banner.style.opacity = 1; };
        banner.src = selected.path;

        // --- Interaction Tracking ---

        // 1. Banner click (just tracking, usually relies on user manually switching apps)
        banner.onclick = function() {
            trackInteraction('click_banner', selected.path);
        };

        // 2. Call button click
        if (btnCall) {
            btnCall.onclick = function() {
                trackInteraction('click_call', selected.path);
            };
        }

        // 3. Email button click
        if (btnEmail) {
            btnEmail.onclick = function() {
                trackInteraction('click_email', selected.path);
            };
        }

        // 4. Internet button tracking (skip to internet)
        btnInternet.onclick = function() {
            this.innerText = "Đang kết nối...";
            this.style.opacity = "0.7";
            trackInteraction('skip', selected.path).then(function() {
                document.getElementById("authenticatedFrm").submit();
            });
        };
    })
    .catch(function(err) {
        console.error("Failed to load manifest:", err);
        // Fallback: allow internet access anyway
        btnInternet.onclick = function() { document.getElementById("authenticatedFrm").submit(); };
    });

// 5. Progress bar timer
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
