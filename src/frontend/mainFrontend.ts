(function () {
    const navMenu: HTMLElement = document.querySelector('#navigation_menu') as HTMLElement;
    navMenu.addEventListener('click', function (e: MouseEvent) {
        const item = e.target;
        if (item instanceof HTMLElement && item.classList.contains('item')) {
            this.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
            item.classList.add('active')

            const newPageToShow = item.dataset['navtype'];
            document.querySelectorAll('.import-category').forEach((i) => i.classList.add('hidden'));
            document.querySelector(`#${newPageToShow}`).classList.remove('hidden');
        }
    });

    // if ($('body').data('dimmer') === 'on') {
    //     // @ts-ignore
    //     const $clone = $('#dimmerNoSublimeFolderTemplate > .dimmer').clone();
    //     // @ts-ignore
    //     $clone.dimmer('set page dimmer');
    //     $('body').append($clone);
    //     // @ts-ignore
    //     $clone.dimmer('show');
    // }
})()



