const videoTypes = {
    'FLV': {
        '5' : '224p',
        '6' : '270p',
        '34': '360p',
        '35': '480p'
    },
    '3GP': {
        '17' : '144p',
        '36' : '240p'
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
    'MP4 (video-only)': {
        '160' : '144p',
        '133' : '240p',
        '134' : '360p',
        '135' : '480p',
        '136' : '720p',
        '137' : '1080p'
    },
    'MP4 (audio-only)': {
        '139' : '48kbs',
        '140' : '128kbs',
        '141' : '256kbs'
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

const fmtStreamMapPattern = /"url_encoded_fmt_stream_map": "([^"]+)"/;
const adaptiveFmtStreamMapPattern = /"adaptive_fmts": "([^"]+)"/;
const fmtITagPattern = /itag=(\d+)/;
const fmtUrlPattern = /url=([^&]+)/;
const fmtSigPattern = /sig=([^&]+)/;

function showDownloadLinks(fmtUrlList) {
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

function extractUrl(text) {
    var urlMatch = fmtUrlPattern.exec(text);
    return unescape(urlMatch[1]);
}

function extractUrlWithSig(text) {
    var sigMatch = fmtSigPattern.exec(text);
    return extractUrl(text) + '&signature=' + unescape(sigMatch[1]);
}

function createFmtUrlList(fmtStreamMap, urlExtractor, fmtUrlList) {
    var fmtStreamList = fmtStreamMap
        .replace(/\\u0026/g, '&')
        .split(',');

    fmtUrlList = fmtUrlList || {};
    for (var index in fmtStreamList) {
        var text = fmtStreamList[index];
        var itagMatch = fmtITagPattern.exec(text);
        fmtUrlList[itagMatch[1]] = urlExtractor(text);
    }

    return fmtUrlList;
}

$(document).ready(function() {
    var script = $('script:contains(\'"url_encoded_fmt_stream_map"\')')[0].text;
    var fmtUrlList = {};

    var fmtStreamMap = fmtStreamMapPattern.exec(script)[1];
    createFmtUrlList(fmtStreamMap, extractUrlWithSig, fmtUrlList);

    var adaptiveFmtStreamMap = adaptiveFmtStreamMapPattern.exec(script)[1];
    createFmtUrlList(adaptiveFmtStreamMap, extractUrl, fmtUrlList);

    showDownloadLinks(fmtUrlList);
});

