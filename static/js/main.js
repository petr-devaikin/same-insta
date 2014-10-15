$(function () {
    getNewPhotos('', tag);
});

function getNewPhotos(next_url, tag) {
    $.getJSON(next_images_url, { next: next_url, tag: tag })
        .success(function (data) {
            var images = data['images'];
            for (var i in images)
                addNewPhotos(images[i])

            if (data['next_url'])
                getNewPhotos(data['next_url']);
        });
}

function addNewPhotos(image) {
    var container = $('<div>').addClass('image')
        .append('<a href="' + image['link'] + '" target="blank"><img src="' + image['img'] + '" /></a>');

    for (var f in image['faces']) {
        var face = image['faces'][f];
        var face_tag = $('<div>').addClass('face')
            .css('left', face[0] + 'px')
            .css('top', face[1] + 'px')
            .css('width', face[2] + 'px')
            .css('height', face[3] + 'px');
        container.append(face_tag);
    }

    $('#images').append(container);
}