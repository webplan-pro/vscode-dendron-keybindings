(function () {
    // @ts-ignore
    const $clone = $('#dimmerNoSublimeFolderTemplate > .dimmer').clone();
    // @ts-ignore
    $clone.dimmer('set page dimmer');
    $('body').append($clone);
    // @ts-ignore
    $clone.dimmer('show');
})();