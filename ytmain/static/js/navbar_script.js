document.getElementById('navbarToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    var content = document.getElementById('content');
    if (navbar.classList.contains('open')) {
        navbar.classList.remove('open');
        content.classList.remove('shifted');
    } else {
        navbar.classList.add('open');
        content.classList.add('shifted');
    }
});

document.querySelectorAll('.navbar a').forEach(function(link) {
    link.addEventListener('click', function(event) {
        var currentPage = window.location.pathname;
        var linkPage = link.getAttribute('data-page');
        if (currentPage === linkPage) {
            event.preventDefault(); // Prevent the default action
        }
    });
});

function myPlaylists() {
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
                <button onclick="#">${playlist.name}</button>
            `;
            playlistList.appendChild(ul);
        });
        showShowPlaylistsModal(); // Show the playlists modal
    })
    .catch(error => console.error('Error fetching playlists:', error));
}
//when the queue is empty and add to playlist is empty and show playlists is empty show a message
function showShowPlaylistsModal() {
    const showPlaylistModal = document.getElementById('showPlaylists');
    showPlaylistModal.style.display = 'block';
}

function hideShowPlaylistsModal() {
    document.getElementById('showPlaylists').style.display = 'none';
}