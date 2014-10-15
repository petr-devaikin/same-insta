$(function () {
    getNewPhotos('');
});

function getNewPhotos(id) {
    $.getJSON('/next_images', { img_id: id })
        .success(function (data) {
            var result = data['result'];
            for (var r in result) {
                var image = result[r];
                var container = $('<div>').addClass('image')
                    .append('<img src="' + image['img'] + '" />');
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
            if (data['last_id'])
                getNewPhotos(data['last_id']);
        });
}