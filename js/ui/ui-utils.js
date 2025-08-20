/**
 * UI utility functions extracted from inline JavaScript
 */

// Navigation and game creation functions
function newgamecreate() {
    try {
        Android.showToast('https://chokosta.herokuapp.com/client/');
    } catch (err) {
        location.assign('https://chokosta.herokuapp.com/client/');
    }
}

// Social media links
function openLinkedin() {
    window.open('https://linkedin.com/in/subhajitmahata');
}

function shareWhatsapp() {
    window.open('https://api.whatsapp.com/send?phone=919732273358&text=*Hi%20Subhajit*%20I%20have%20played%20your%20game.&#128578;%20*My%20feedback*%20&source=&data=#');
}

function mailBug() {
    window.open('mailto://subhajitmahata06@gmail.com');
}

// Sidebar toggle functionality
function toggleslidebar() {
    const slidebar = document.getElementById('slidebar');
    if (slidebar) {
        slidebar.classList.toggle('active');
    }
}