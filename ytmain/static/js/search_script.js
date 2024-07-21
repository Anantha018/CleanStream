// Check whether the audio url is valid or not and if it is not then dont add to queue or to the playlist do this check when they are adding not while searching

let queue = [];
let currentIndex = -1; // -1 means no song is currently being played
let lastPlayedSong = null; // To store the last played asong when the queue is empty
let isLooping = false; // Flag to indicate if loop mode is enabled

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'inline' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    fetchQueue(); 
    toggleClearQueueButton();
    const audioPlayer = document.getElementById('audioPlayer');
});

function fetchQueue() {
    fetch('/get-queue/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            queue = data.queue.map(item => ({
                videoUrl: item.video_url,
                title: item.title
            }));
            updateQueueDisplay();
        } else {
            // Silently fail without logging or showing any message
        }
    })
    .catch(error => {
        // Silently fail without logging or showing any message
    });
}


function search() {
    const query = document.getElementById('query').value;
    showLoading(true); // Show loading indicator
    document.getElementById('searchButton').disabled = true; // Disable search button

    fetch(`/search/?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ''; // Clear previous results
        showLoading(false); // Hide loading indicator
        document.getElementById('searchButton').disabled = false; // Enable search button

        if (data.results && data.results.length > 0) {
            const ul = document.createElement('ul');

            data.results.forEach(result => {
                if (result && result.link && result.title && result.thumbnail) {
                    createResultElement(result.link, result.title, result.thumbnail, ul);
                } else {
                    // Silently fail without logging or showing any message
                }
            });

            if (ul.children.length > 0) {
                resultsDiv.appendChild(ul);
            } else {
                resultsDiv.innerHTML = 'No results found.';
            }
        } else {
            resultsDiv.innerHTML = 'No results found.';
        }
    })
    .catch(error => {
        showLoading(false); // Hide loading indicator in case of error
        document.getElementById('searchButton').disabled = false; // Enable search button
        // Silently fail without logging or showing any message
    });
}

document.getElementById('query').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submit action
        search();
    }
});

// Function to create result element
function createResultElement(videoUrl, title, thumbnail, ul) {
    const li = document.createElement('li');
    li.innerHTML = `
        <img src="${thumbnail}" alt="Thumbnail">
        <span onclick="playAudio('${videoUrl}', false, '${title}')">${title}</span>
        <div class="menu-container">
            <button class="menu-icon" onclick="toggleDropdown(event)">&#x22EE;</button>
            <div class="dropdown-menu">
                <button onclick="addToQueue('${videoUrl}', '${title}')">Add to Queue</button>
                <button onclick="showPlaylists('${videoUrl}', '${title}')">Add to Playlist</button>
            </div>
        </div>
    `;
    ul.appendChild(li);
}

function showPlaylists(videoUrl, title) {
    fetch('/get-playlists/', {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
        const playlistList = document.getElementById('playlistList');
        playlistList.innerHTML = ''; // Clear any existing playlists
        data.playlists.forEach(playlist => {
            const ul = document.createElement('ul');
            ul.innerHTML = `
                <button onclick="addToPlaylist('${playlist.id}', '${videoUrl}', '${title}')">${playlist.name}</button>
            `;
            playlistList.appendChild(ul);
        });
        showShowPlaylistsModal(); // Show the playlists modal
    })
    .catch(error => {
        // Silently fail without logging or showing any message
    });
}

// Show the Playlists Modal
function showShowPlaylistsModal() {
    const showPlaylistModal = document.getElementById('showPlaylistsModal');
    const playlistList = document.getElementById('playlistList');
    const emptyPlaylistMessage = document.getElementById('emptyPlaylistMessage');
    
    showPlaylistModal.style.display = 'block';
    showPlaylistModal.style.fontFamily = 'Verdana, Geneva, Tahoma, sans-serif';
    
    // Check if the playlist list is empty
    if (playlistList.children.length === 0) {
        emptyPlaylistMessage.style.display = 'block';
    } else {
        emptyPlaylistMessage.style.display = 'none';
    }
}

// Hide the Playlists Modal
function hideShowPlaylistsModal() {
    document.getElementById('showPlaylistsModal').style.display = 'none';
}

function addToPlaylist(playlistId, videoUrl, title) {
    const formData = new FormData();
    formData.append('playlist_id', playlistId);
    formData.append('video_url', videoUrl);
    formData.append('title', title);

    fetch('/add-to-playlist/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification(`Added ${title}`);
        } else {
            showNotification(data.message);
        }
    })
    .catch(error => {
        showNotification('Failed to add to playlist');
    });
}

function createPlaylist() {
    const playlistNameInput = document.getElementById('playlistNameInput');
    const checkPlaylistName = playlistNameInput.value.trim(); // Remove extra spaces

    if (checkPlaylistName === '') {
        alert('Please enter a valid playlist name.');
        return; 
    }

    const playlistName = document.getElementById('playlistNameInput').value;
    if (playlistName) {
        const formData = new FormData();
        formData.append('name', playlistName);

        fetch('/create-playlist/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification(`Created ${playlistName} playlist`); // Refresh playlist options
                playlistNameInput.value = ''; // Clear the input field
                hideCreatePlaylistModal();
            } else {
                showNotification(data.message);
            }
        })
        .catch(error => {
            showNotification('Failed to create playlist');
        });
    }
}

function showCreatePlaylistModal() {
    const createPlaylistModal = document.getElementById('createPlaylistModal');
    createPlaylistModal.style.display = 'block';
    createPlaylistModal.style.fontFamily = 'Verdana, Geneva, Tahoma, sans-serif';
}

// Hide the modal
function hideCreatePlaylistModal() {
    document.getElementById('createPlaylistModal').style.display = 'none';
}

// Toggle dropdown visibility
function toggleDropdown(event) {
    const dropdown = event.target.nextElementSibling;
    const isVisible = dropdown.style.display === 'block';
    closeAllDropdowns(); // Close any open dropdowns
    dropdown.style.display = isVisible ? 'none' : 'block';
}

// Close all dropdowns
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(menu => menu.style.display = 'none');
}

// Fetch audio URL and cache it
function fetchAudioUrl(videoUrl) {
    const timeout = 10000; // Timeout in milliseconds (10 seconds)

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
    );

    const fetchPromise = fetch(`/audio/?url=${encodeURIComponent(videoUrl)}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => data.audio_url || null)
    .catch(() => null);

    return Promise.race([fetchPromise, timeoutPromise]);
}

// Add video to queue
function addToQueue(videoUrl, title) {
    // Check if the video already exists in the queue
    if (queue.some(item => item.videoUrl === videoUrl)) {
        showNotification('Song is already in the queue');
        return;
    }

    const formData = new FormData();
    formData.append('video_url', videoUrl);
    formData.append('title', title);

    fetch('/add-to-queue/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            queue.unshift({ videoUrl, title });
            fetchQueue();
            updateQueueDisplay();
            showNotification('Added to Queue');
        } else {
            showNotification(data.message);
        }
    })
    .catch(error => {
        showNotification('Failed to add to queue');
    });
}

function updateQueueDisplay() {
    const queueList = document.getElementById('queueList');
    const emptyQueueMessage = document.getElementById('emptyQueueMessage');

    // Clear previous queue items
    queueList.innerHTML = '';

    // Check if the queue is empty
    if (queue.length === 0) {
        // Show the empty message
        emptyQueueMessage.style.display = 'block';
    } else {
        // Hide the empty message
        emptyQueueMessage.style.display = 'none';

        // Add items to the list in the order they appear in the queue array
        queue.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('queue-item');
            li.innerHTML = `
                <div class="queue-item">
                    <span class="queue-list" onclick="playAudioFromQueue(${index})">${item.title}</span>
                    <button class="remove-button" onclick="removeFromQueue(${index})"><i class="fas fa-minus-circle"></i></button>
                </div>          
            `;
            queueList.appendChild(li);
        });
    }

    toggleClearQueueButton(); // Show or hide the 'Clear Queue' button based on queue status
}

function addPlaylistToQueue(videoUrl, title) {
    const formData = new FormData();
    formData.append('video_url', videoUrl);
    formData.append('title', title);

    return fetch('/add-to-queue/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            queue.push({ videoUrl, title });  // Add to the end of the queue
            return { videoUrl, title };  // Return data for chaining
        } else {
            showNotification(data.message);
            throw new Error(data.message);  // Reject the promise if there is an error
        }
    })
    .catch(error => {
        showNotification('Failed to add to queue');
        throw error;  // Re-throw to handle in the calling function
    });
}

function disableMenuContainers() {
    const menuContainers = document.querySelectorAll('.menu-container');
    menuContainers.forEach(container => {
        container.classList.add('disabled');
    });
}

function enableMenuContainers() {
    const menuContainers = document.querySelectorAll('.menu-container');
    menuContainers.forEach(container => {
        container.classList.remove('disabled');
    });
}


async function addItemsToQueueSequentially(items) {
    for (const item of items) {
        try {
            await addPlaylistToQueue(item.video_url, item.title);
            
        } catch (error) {
            //Do nothing
        }
    }
    fetchQueue();
}

function removeFromQueue(index) {
    const title = queue[index].title;
    fetch('/remove-from-queue/', {
        method: 'POST',
        headers: {  
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: new URLSearchParams({
            'title': title
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const wasPlayingFromQueue = currentIndex >= 0 && currentIndex < queue.length;
            queue.splice(index, 1);
            if (wasPlayingFromQueue && currentIndex === index) {
                audioPlayer.pause();
                if (queue.length > 0) {
                    currentIndex = Math.min(currentIndex, queue.length - 1);
                    playQueue();
                } else {
                    currentIndex = -1;
                }
                updateQueueDisplay();
            } else {
                if (currentIndex > index) {
                    currentIndex--;
                }
                updateQueueDisplay();
            }
        } else {
            showNotification(data.message);
        }
    })
    .catch(error => {
        //do nothing
    });
}

function playAudio(videoUrl, fromQueue = false, songTitle='Unknown title') {
    const audioTitleElement = document.getElementById('audioTitle');
    audioTitleElement.textContent = songTitle; // Set the title text

    if (!videoUrl) {
        return;
    }
    fetchAudioUrl(videoUrl).then(audioUrl => {
        if (audioUrl) {
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';
            audioPlayer.play();

            if (fromQueue) {
                currentIndex = queue.findIndex(item => item.videoUrl === videoUrl); // Use videoUrl
            }
            showNotification(`Now playing: ${songTitle}`);
            document.title = songTitle;
            document.classList.add('audio-title');
        } else {
            showNotification("Retry or song unavailable");
            document.title = 'Clean Stream'
        }
    }).catch(error => {
        //do nothing
    });
}

function playAudioFromQueue(index) {
    if (queue[index]) {
        currentIndex = index;
        playAudio(queue[currentIndex].videoUrl, true, queue[currentIndex].title);
    } else {
        //do nothing
    }
}

function playQueue() {
    if (queue.length > 0) {
        currentIndex = 0;
        playAudio(queue[currentIndex].videoUrl, true, queue[currentIndex].title);
    }
}

function clearQueue() {
    fetch('/clear-queue/', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            queue = [];
            currentIndex = -1;
            updateQueueDisplay();
        } else {
            showNotification('Failed to clear queue');
        }
    })
    .catch(error => {
        showNotification('Error clearing queue');
    });
}

function playPreviousButton() {
    if (currentIndex > 0) {
        currentIndex--;
        playAudioFromQueue(currentIndex);
    } else if (queue.length > 0) {
        playAudioFromQueue(0); // Play the first song if no previous song is available
    }
}

function playNextButton() {
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        currentIndex++;
        playAudioFromQueue(currentIndex);
    } else if (queue.length > 0) {
        playAudioFromQueue(0); // Loop to the first song if at the end of the queue
    }
}

function toggleLoop() {
    isLooping = !isLooping;
    const loopButton = document.getElementById('loopButton');
    if (isLooping) {
        loopButton.classList.add('active'); 
        showNotification('Loop mode enabled');
    } else {
        loopButton.classList.remove('active'); 
        showNotification('Loop mode disabled');
    }
}

function toggleClearQueueButton() {
    const clearQueueButton = document.getElementById('clearQueueButton');
    if (queue.length > 0) {
        clearQueueButton.style.display = 'block';
    } else {
        clearQueueButton.style.display = 'none';
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.classList.remove('hide');
    notification.classList.add('show');
    notification.classList.add('audio-title');

    // Remove the notification after a delay
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
    }, 4000); // Duration to show notification (3 seconds)
}

// Toggle the queue window visibility
function toggleQueueWindow() {
    const queueWindow = document.getElementById('queueWindow');
    const isVisible = queueWindow.style.display === 'block';
    queueWindow.style.display = isVisible ? 'none' : 'block';
}

// Function to play the next song in the queue
function playNextInQueue() {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
        currentIndex++;
        playAudio(queue[currentIndex].videoUrl, true, queue[currentIndex].title);
    } else {
        currentIndex = -1;
        audioPlayer.pause();
    }
}

// Event listener for when the audio ends
audioPlayer.addEventListener('ended', function() {
    if (isLooping) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        playNextInQueue();
    }
});

document.addEventListener('click', function(event) {
    const target = event.target;
    if (!target.matches('.menu-icon')) {
        closeAllDropdowns();
    }
});

// Get the search container element (replace 'searchContainer' with the actual ID or class of your search container)
const searchContainer = document.getElementById('search-container');

// Function to check if an element is in the viewport
function isInViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to update button state
function updateButtonState() {
  if (!navbarToggle) return; // Exit if button doesn't exist

  if (window.scrollY > 0) {
    // Page has been scrolled
    navbarToggle.disabled = searchContainer ? !isInViewport(searchContainer) : true;
  } else {
    // At the top of the page
    navbarToggle.disabled = false;
  }
}

// Add scroll event listener
window.addEventListener('scroll', updateButtonState);

// Initial call to set correct state on page load
updateButtonState();


document.addEventListener('DOMContentLoaded', function() {
    fetchQueue(); 
    toggleClearQueueButton();
    const audioPlayer = document.getElementById('audioPlayer');

    let wakeLock = null;

    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('');
            });
            console.log('');
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    // Request wake lock when the audio starts playing
    audioPlayer.addEventListener('play', requestWakeLock);

    // Release wake lock when the audio is paused or ends
    audioPlayer.addEventListener('pause', () => {
        if (wakeLock !== null) {
            wakeLock.release().then(() => {
                wakeLock = null;
            });
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (wakeLock !== null) {
            wakeLock.release().then(() => {
                wakeLock = null;
            });
        }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        } else {
            if (wakeLock !== null) {
                wakeLock.release().then(() => {
                    wakeLock = null;
                });
            }
        }
    });
});


// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;    

    
}
