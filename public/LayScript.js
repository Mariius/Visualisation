let openContainerId = null; // Verfolge den aktuell geöffneten Container

function openContainer(containerId) {
    // Überprüfe, ob bereits ein Container geöffnet ist
    if (openContainerId) {
        // Schließe den aktuellen geöffneten Container
        closeContainer(openContainerId);
    }

    // Öffne den ausgewählten Container
    document.getElementById(containerId).style.display = 'block';
    document.getElementById('main-content').style.flex = '0 0 66.66%';
    document.getElementById(containerId).style.flex = '0 0 33.33%';

    // Aktualisiere den aktuell geöffneten Container
    openContainerId = containerId;
}

function closeContainer(containerId) {
    document.getElementById(containerId).style.display = 'none';
    document.getElementById('main-content').style.flex = '1';

    // Setze den aktuell geöffneten Container zurück
    openContainerId = null;
}
