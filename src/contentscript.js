(function() {

const VIDEO_TYPES = {
    'FLV': [
        { i: '5', n: '224p' },
        { i: '6', n: '270p' },
        { i: '34', n: '360p' },
        { i: '35', n: '480p' }
    ],
    '3GP': [
        { i: '17', n: '144p' },
        { i: '36', n: '240p' }
    ],
    'MP4': [
        { i: '18', n: '360p' },
        { i: '22', n: '720p' },
        { i: '37', n: '1080p' },
        { i: '38', n: '2304p' }
    ],
    'MP4 (3D)': [
        { i: '83', n: '240p' },
        { i: '82', n: '360p' },
        { i: '85', n: '520p' },
        { i: '84', n: '720p' }
    ],
    'MP4 (video-only)': [
        { i: '160', n: '144p' },
        { i: '133', n: '240p' },
        { i: '134', n: '360p' },
        { i: '135', n: '480p' },
        { i: '136', n: '720p' },
        { i: '137', n: '1080p' }
    ],
    'MP4 (audio-only)': [
        { i: '139', n: '48kbs' },
        { i: '140', n: '128kbs' },
        { i: '141', n: '256kbs' }
    ],
    'WebM': [
        { i: '43', n: '360p' },
        { i: '44', n: '480p' },
        { i: '45', n: '720p' }
    ],
    'WebM (3D)': [
        { i: '100', n: '360p' },
        { i: '101', n: '480p' },
        { i: '46', n: '540p' },
        { i: '102', n: '720p' }
    ]
};

const FMT_STREAM_MAP_PTN = /"url_encoded_fmt_stream_map": "([^"]+)"/;
const ADAPTIVE_FMT_STREAM_MAP_PTN = /"adaptive_fmts": "([^"]+)"/;
const FMT_ITAG_PTN = /itag=(\d+)/;
const FMT_URL_PTN = /url=([^&]+)/;
const FMT_SIG_PTN = /s=([^&]+)/;

function showDownloadLinks(title, fmtUrlList) {
    var links,
        type,
        videoList,
        inUrlList,
        item,
        index,
        fmt,
        anchor,
        button,
        panel;

    inUrlList = function(fmt) {
        return fmt.i in fmtUrlList;
    };

    links = $('<ul>').attr('id', 'download-list');
    for (type in VIDEO_TYPES) {
        videoList = VIDEO_TYPES[type].filter(inUrlList);
        if (!videoList.length) { continue; }

        item = $('<li>').attr({'style': 'padding: 3px 10px'});
        item.append($('<span>').attr({
            'style': 'display: inline-block; width: 120px'
        }).append(type + ':'));

        for (index in videoList) {
            fmt = videoList[index];
            item.append($('<a>').attr({
                'href': fmtUrlList[fmt.i] + '&title=' + title,
                'style': 'display: inline-block; width: 50px'
            }).append(fmt.n));
        }

        links = links.append(item);
    }

    panel = $('<div>').attr({
        'id': 'action-panel-download',
        'class': 'action-panel-content hid',
        'data-panel-loaded': 'true'
    }).append($('<div>').attr({
        'id': 'watch-actions-download',
        'class': 'watch-actions-panel'
    }).append(links));
    $('#action-panel-details').after(panel);

    anchor = $('#watch7-secondary-actions').find('span').first();
    button = anchor.clone();
    button.find('button')
        .attr('data-trigger-for', 'action-panel-download')
        .removeClass('yt-uix-button-toggled');
    button.find('span').text('下載');
    anchor.after(button);
}

function extractTitle() {
    var title = $('#eow-title').attr('title');
    return encodeURIComponent(title).replace(/%20/g, '+');
}

function extractSig(s) {
    return s.slice(5, 56) + s[3] + s.slice(57);
}

function extractUrl(text) {
    var urlMatch = FMT_URL_PTN.exec(text);
    return decodeURIComponent(urlMatch[1]);
}

function extractUrlWithSig(text) {
    var sigMatch = FMT_SIG_PTN.exec(text),
        sig = extractSig(sigMatch[1]);
    return extractUrl(text) + '&signature=' + sig;
}

function createFmtUrlList(fmtStreamMap, urlExtractor, fmtUrlList) {
    var fmtStreamList,
        index,
        text,
        itagMatch;

    fmtStreamList = fmtStreamMap
        .replace(/\\u0026/g, '&')
        .split(',');

    fmtUrlList = fmtUrlList || {};
    for (index in fmtStreamList) {
        text = fmtStreamList[index];
        itagMatch = FMT_ITAG_PTN.exec(text);
        fmtUrlList[itagMatch[1]] = urlExtractor(text);
    }

    return fmtUrlList;
}

$(document).ready(function() {
    var title,
        script,
        fmtUrlList,
        fmtStreamMap,
        adaptiveFmtStreamMap;

    title = extractTitle();
    script = $('script:contains(\'"url_encoded_fmt_stream_map"\')')[0].text;
    fmtUrlList = {};

    fmtStreamMap = FMT_STREAM_MAP_PTN.exec(script)[1];
    createFmtUrlList(fmtStreamMap, extractUrlWithSig, fmtUrlList);

    adaptiveFmtStreamMap = ADAPTIVE_FMT_STREAM_MAP_PTN.exec(script)[1];
    createFmtUrlList(adaptiveFmtStreamMap, extractUrlWithSig, fmtUrlList);

    showDownloadLinks(title, fmtUrlList);
});

})();
