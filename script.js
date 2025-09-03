document.addEventListener('DOMContentLoaded', () => {
    const playlistEl = document.getElementById('playlist');
    const addSongForm = document.getElementById('addSongForm');
    const songNameInput = document.getElementById('songName');
    const artistNameInput = document.getElementById('artistName');
    const searchInput = document.getElementById('searchInput');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const progressBar = document.getElementById('progressBar');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const initialSongs = [
        { name: "Blinding Lights", artist: "The Weeknd" },
        { name: "Levitating", artist: "Dua Lipa" },
        { name: "As It Was", artist: "Harry Styles" },
        { name: "Bad Guy", artist: "Billie Eilish" },
        { name: "Watermelon Sugar", artist: "Harry Styles" }
    ];

    let playlist = initialSongs;
    let nowPlayingIndex = -1;
    let progress = 0;
    let intervalId;

    // Function to render the playlist on the page
    const renderPlaylist = () => {
        playlistEl.innerHTML = '';
        playlist.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === nowPlayingIndex) {
                li.classList.add('playing');
            }
            li.innerHTML = `
                <span>${song.name} - ${song.artist}</span>
                <div>
                    <button class="play-btn" data-index="${index}">▶️</button>
                    <button class="delete-btn" data-index="${index}">❌</button>
                </div>
            `;
            playlistEl.appendChild(li);
        });
    };

    // Add a new song
    addSongForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSong = {
            name: songNameInput.value.trim(),
            artist: artistNameInput.value.trim()
        };
        playlist.push(newSong);
        songNameInput.value = '';
        artistNameInput.value = '';
        renderPlaylist();
    });

    // Delete or play a song
    playlistEl.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('delete-btn')) {
            const index = parseInt(target.getAttribute('data-index'));
            playlist.splice(index, 1);
            if (index === nowPlayingIndex) {
                stopPlayback();
            } else if (index < nowPlayingIndex) {
                nowPlayingIndex--;
            }
            renderPlaylist();
        } else if (target.classList.contains('play-btn')) {
            const index = parseInt(target.getAttribute('data-index'));
            startPlayback(index);
        }
    });

    // Search and filter songs
    searchInput.addEventListener('keyup', () => {
        const query = searchInput.value.toLowerCase();
        const items = playlistEl.getElementsByClassName('playlist-item');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Shuffle the playlist
    shuffleBtn.addEventListener('click', () => {
        for (let i = playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
        }
        renderPlaylist();
        stopPlayback();
    });

    // Drag-and-drop to reorder using Sortable.js
    new Sortable(playlistEl, {
        animation: 150,
        onEnd: (evt) => {
            const movedItem = playlist.splice(evt.oldIndex, 1)[0];
            playlist.splice(evt.newIndex, 0, movedItem);

            // Correctly update the nowPlayingIndex
            if (nowPlayingIndex !== -1) {
                if (nowPlayingIndex === evt.oldIndex) {
                    nowPlayingIndex = evt.newIndex;
                } else if (nowPlayingIndex > evt.oldIndex && nowPlayingIndex <= evt.newIndex) {
                    nowPlayingIndex--;
                } else if (nowPlayingIndex < evt.oldIndex && nowPlayingIndex >= evt.newIndex) {
                    nowPlayingIndex++;
                }
            }
            renderPlaylist(); // Rerender to apply new indexes and highlighting
        }
    });

    // Simulate song playback
    const startPlayback = (index) => {
        nowPlayingIndex = index;
        nowPlayingTitle.textContent = `Now Playing: ${playlist[index].name} - ${playlist[index].artist}`;
        renderPlaylist();

        progress = 0;
        progressBar.style.width = '0%';
        clearInterval(intervalId); // Clear any existing interval
        intervalId = setInterval(() => {
            progress += 1; // Increase by 1% per interval
            progressBar.style.width = `${progress}%`;

            if (progress >= 100) {
                clearInterval(intervalId);
                stopPlayback();
                if (nowPlayingIndex < playlist.length - 1) {
                    startPlayback(nowPlayingIndex + 1);
                }
            }
        }, 100); // Update every 100 milliseconds
    };

    const stopPlayback = () => {
        clearInterval(intervalId);
        nowPlayingIndex = -1;
        nowPlayingTitle.textContent = 'Now Playing:';
        progressBar.style.width = '0%';
        renderPlaylist();
    };

    // Initial render of the playlist
    renderPlaylist();
});