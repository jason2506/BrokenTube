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
const FMT_SIG_PTN = /sig=([^&]+)/;
const FMT_ENCODED_SIG_PTN = /s=([^&]+)/;

function insertAfter(element, target) {
    var parent = target.parentNode;
    if (parent.lastChild === target) {
        parent.appendChild(element);
    }
    else {
        parent.insertBefore(element, target.nextSibling);
    }
}

function extractTitle() {
    return document.getElementById('eow-title').textContent;
}

function extractScript() {
    var scripts,
        content,
        length,
        index;

    scripts = document.getElementsByTagName('script');
    length = scripts.length;
    for (index = 0; index < length; index++) {
        content = scripts[index].textContent;
        if (content.indexOf('url_encoded_fmt_stream_map') >= 0) {
            return content;
        }
    }
}

function extractUrl(text) {
    var urlMatch = FMT_URL_PTN.exec(text);
    return decodeURIComponent(urlMatch[1]);
}

function decodeSig(s) {
    s = s.slice(0, 12) + s[80] + s.slice(13, 52) + s[12] +
        s.slice(53, 80) + s[52];
    return s.split('').reverse().join('');
}

function extractUrlWithSig(text) {
    var sigMatch,
        url;

    url = extractUrl(text);
    if ((sigMatch = FMT_SIG_PTN.exec(text)) !== null) {
        url += '&signature=' + sigMatch[1];
    }
    else if ((sigMatch = FMT_ENCODED_SIG_PTN.exec(text)) !== null) {
        url += '&signature=' + decodeSig(sigMatch[1]);
    }

    return url;
}

function appendFmtUrlList(fmtStreamMap, fmtUrlList) {
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
        fmtUrlList[itagMatch[1]] = extractUrlWithSig(text);
    }

    return fmtUrlList;
}

function createLinksItem(title, headerText, videoList, fmtUrlList) {
    var item,
        header,
        link,
        length,
        index,
        fmt,
        url;

    header = document.createElement('span');
    header.setAttribute('style', 'display: inline-block; width: 120px');
    header.textContent = headerText + ':';

    item = document.createElement('li');
    item.setAttribute('style', 'padding: 3px 10px');
    item.appendChild(header);

    length = videoList.length;
    for (index = 0; index < length; index++) {
        fmt = videoList[index];
        url = fmtUrlList[fmt.i];

        link = document.createElement('a');
        link.setAttribute('style', 'display: inline-block; width: 50px');
        link.setAttribute('href', url);
        link.setAttribute('download', title);
        link.textContent = fmt.n;
        item.appendChild(link);
    }

    return item;
}

function createPanel(links) {
    var panel,
        panelWrapper;

    panel = document.createElement('div');
    panel.id = 'watch-actions-download';
    panel.className = 'watch-actions-panel';
    panel.appendChild(links);

    panelWrapper = document.createElement('div');
    panelWrapper.id = 'action-panel-download';
    panelWrapper.className = 'action-panel-content hid';
    panelWrapper.setAttribute('data-panel-loaded', 'true');
    panelWrapper.appendChild(panel);

    return panelWrapper;
}

function cloneButton(buttonWrapper) {
    var newButtonWrapper,
        button,
        buttonText;

    newButtonWrapper = buttonWrapper.cloneNode(true);

    button = newButtonWrapper.getElementsByTagName('button')[0];
    button.setAttribute('data-trigger-for', 'action-panel-download');
    button.classList.remove('yt-uix-button-toggled');

    buttonText = newButtonWrapper.getElementsByTagName('span')[0];
    buttonText.textContent = '下載';

    return newButtonWrapper;
}

function showDownloadLinks(title, fmtUrlList) {
    var type,
        videoList,
        inUrlList,
        links,
        item,
        panelBefore,
        panel,
        buttonBefore,
        button;

    inUrlList = function(fmt) {
        return fmt.i in fmtUrlList;
    };

    links = document.createElement('ul');
    links.id = 'download-list';
    for (type in VIDEO_TYPES) {
        videoList = VIDEO_TYPES[type].filter(inUrlList);
        if (!videoList.length) { continue; }

        item = createLinksItem(title, type, videoList, fmtUrlList);
        links.appendChild(item);
    }

    panel = createPanel(links);
    panelBefore = document.getElementById('action-panel-details');
    insertAfter(panel, panelBefore);

    buttonBefore = document.querySelector('#watch7-secondary-actions span');
    button = cloneButton(buttonBefore);
    insertAfter(button, buttonBefore);
}

function ready() {
    var title,
        script,
        fmtUrlList,
        fmtStreamMap,
        adaptiveFmtStreamMap;

    title = extractTitle();
    script = extractScript();
    fmtUrlList = {};

    fmtStreamMap = FMT_STREAM_MAP_PTN.exec(script)[1];
    appendFmtUrlList(fmtStreamMap, fmtUrlList);

    adaptiveFmtStreamMap = ADAPTIVE_FMT_STREAM_MAP_PTN.exec(script)[1];
    appendFmtUrlList(adaptiveFmtStreamMap, fmtUrlList);

    showDownloadLinks(title, fmtUrlList);
}

ready();
