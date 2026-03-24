// splash.js — dynamic captive portal logic

// 1. Get NoDogSplash MAC from URL (e.g., ?mac=00:11:22:33:44:55)
function getQueryParam(param) {
    var searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

// 2. Track interaction by sending POST to the local router CGI
function trackInteraction(action, adId) {
    var mac = getQueryParam("clientmac") || getQueryParam("mac");
    if (!mac) return Promise.resolve(); // Can't track without MAC

    return fetch('/cgi-bin/portal', {
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

        // Banner click tracking
        banner.onclick = function() {
            trackInteraction('click', selected.path);
            // Optionally redirect here if there's a known URL for the ad, 
            // or rely on the user manually switching apps.
        };

        // Internet button tracking
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
