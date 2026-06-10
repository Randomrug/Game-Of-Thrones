const themeMusic = document.getElementById("theme-music");
const musicToggle = document.getElementById("music-toggle");

if (themeMusic) {
    themeMusic.volume = 0.25;

    const savedTime = localStorage.getItem("got_music_time");
    if (savedTime !== null && !isNaN(savedTime)) {
        try {
            themeMusic.currentTime = parseFloat(savedTime);
        } catch (error) {
            // Ignore invalid restore values.
        }
    }

    const savedMuted = localStorage.getItem("got_music_muted");
    if (savedMuted === "true") {
        themeMusic.pause();
    } else {
        themeMusic.play().catch(() => {});
    }

    function updateMusicIcon() {
        if (!musicToggle) return;
        musicToggle.textContent = themeMusic.paused ? "🔇" : "🔊";
    }

    if (musicToggle) {
        musicToggle.addEventListener("click", () => {
            if (themeMusic.paused) {
                themeMusic.play().catch(() => {});
                localStorage.setItem("got_music_muted", "false");
            } else {
                themeMusic.pause();
                localStorage.setItem("got_music_muted", "true");
            }
            updateMusicIcon();
        });
    }

    document.addEventListener("click", () => {
        if (savedMuted !== "true" && themeMusic.paused) {
            themeMusic.play().catch(() => {});
            updateMusicIcon();
        }
    }, { once: true });

    updateMusicIcon();

    const saveMusicTime = () => {
        localStorage.setItem("got_music_time", themeMusic.currentTime.toString());
    };

    const saveInterval = setInterval(saveMusicTime, 1000);
    window.addEventListener("beforeunload", saveMusicTime);
    themeMusic.addEventListener("timeupdate", saveMusicTime);
}
