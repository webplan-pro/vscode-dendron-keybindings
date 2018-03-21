(function () {
    const $clone = $('#dimmerNoSublimeFolderTemplate > .dimmer').clone();
    $clone.dimmer('set page dimmer');
    $('body').append($clone);
    $clone.dimmer('show');
})();