function showDownloadLinks(fmtUrlList) {
    const videoTypes = {
        'FLV': {
            '5' : '224p',
            '6' : '270p',
            '34': '360p',
            '35': '480p'
        },
        'MP4': {
            '18' : '360p',
            '22' : '720p',
            '37' : '1080p',
            '38' : '2304p'
        },
        'MP4 (3D)': {
            '83' : '240p',
            '82' : '360p',
            '85' : '520p',
            '84' : '720p'
        },
        'WebM': {
            '43' : '360p',
            '44' : '480p',
            '45' : '720p'
        },
        'WebM (3D)': {
            '100' : '360p',
            '101' : '480p',
            '46'  : '540p',
            '102' : '720p'
        }
    };

    var links = $('<ul>').attr('id', 'download-list');
    for (var type in videoTypes) {
        var videoList = [];
        for (var itag in videoTypes[type]) {
            if (itag in fmtUrlList) {
                videoList[videoList.length] = {
                    'name': videoTypes[type][itag],
                    'url' : fmtUrlList[itag]
                };
            }
        }

        if (videoList.length > 0) {
            item = $('<li>').attr({
                'style': 'padding: 3px 10px'
            });

            item.append($('<span>').attr({
                'style': 'display: inline-block; width: 80px'
            }).append(type + ':'));

            for (var index in videoList) {
                item.append($('<a>').attr({
                    'href': videoList[index].url,
                    'style': 'display: inline-block; width: 40px'
                }).append(videoList[index].name));
            }

            links = links.append(item);
        }
    }

    var panel = $('<div>').attr({
        'id': 'action-panel-download',
        'class': 'action-panel-content hid',
        'data-panel-loaded': 'true'
    }).append($('<div>').attr({
        'id': 'watch-actions-download',
        'class': 'watch-actions-panel'
    }).append(links));
    $('#action-panel-details').after(panel);

    var anchor = $('#watch7-secondary-actions').find('span').first();
    var botton = anchor.clone();
    botton.find('button')
        .attr('data-trigger-for', 'action-panel-download')
        .removeClass('yt-uix-button-toggled');
    botton.find('span').text('下載');
    anchor.after(botton);
}

function createFmtUrlList(fmtStreamMap) {
    const fmtUrlPattern = /url=([^&]+)/;
    const fmtITagPattern = /itag=(\d+)/;
    const fmtSigPattern = /sig=([^&]+)/;

    var fmtStreamList = fmtStreamMap
        .replace(/\\u0026/g, '&')
        .split(',');

    var fmtUrlList = {};
    for (var index in fmtStreamList) {
        var urlMatch = fmtUrlPattern.exec(fmtStreamList[index]);
        var itagMatch = fmtITagPattern.exec(fmtStreamList[index]);
        var sigMatch = fmtSigPattern.exec(fmtStreamList[index]);
        fmtUrlList[itagMatch[1]] = unescape(urlMatch[1] + '&signature=' + sigMatch[1]);
    }

    return fmtUrlList;
}

$(document).ready(function() {
    const fmtStreamMapPattern = /"url_encoded_fmt_stream_map": "([^"]+)"/;

    var script = $('script:contains(\'"url_encoded_fmt_stream_map"\')')[0].text;
    var fmtStreamMap = fmtStreamMapPattern.exec(script)[1];
    var fmtUrlList = createFmtUrlList(fmtStreamMap);
    showDownloadLinks(fmtUrlList);
});

