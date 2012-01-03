function showDownloadLinks(fmtUrlList)
{
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
    }

    var links = $('<ul>').attr({
        id: 'download-list',
        style: 'background: #FFF; display: none; margin-bottom: 10px'
    });

    for (var type in videoTypes)
    {
        var videoList = [];
        for (var itag in videoTypes[type])
        {
            if (itag in fmtUrlList)
            {
                videoList[videoList.length] = {
                    'name': videoTypes[type][itag],
                    'url' : fmtUrlList[itag]
                };
            }
        }

        if (videoList.length > 0)
        {
            item = $('<li>').attr({
                'style': 'padding: 3px 10px'
            });

            item.append($('<span>').attr({
                'style': 'display: inline-block; width: 80px'
            }).append(type + ':'));

            for (index in videoList)
            {
                item.append($('<a>').attr({
                    'href': videoList[index].url,
                    'style': 'display: inline-block; width: 40px'
                }).append(videoList[index].name));
            }

            links = links.append(item);
        }
    }

    var button = $('<button>').attr({
        'id': 'download-button',
        'class': 'yt-uix-tooltip-reverse yt-uix-button yt-uix-tooltip',
        'data-tooltip': '下載此影片',
        'data-tooltip-text': '下載此影片'
    }).append($('<span>下載</span>').addClass('yt-uix-button-content'));

    $('#watch-share').after(button);
    $('#watch-actions').after(links);

    $('#download-button').click(function()
    {
        if ($('#download-list').css('display') == 'none')
            $('#download-list').css('display', 'block');
        else $('#download-list').css('display', 'none');
    });
}

function createFmtUrlList(fmtStreamMap)
{
    const fmtUrlPattern = /url=([^&]+)/;
    const fmtITagPattern = /itag=(\d+)/;

    var fmtStreamList = fmtStreamMap.replace(/\\u0026/g, '&').split(',');

    var fmtUrlList = {};
    for (var index in fmtStreamList)
    {
        var urlMatch = fmtUrlPattern.exec(fmtStreamList[index]);
        var itagMatch = fmtITagPattern.exec(fmtStreamList[index]);
        fmtUrlList[itagMatch[1]] = unescape(urlMatch[1]);
    }

    return fmtUrlList;
}

$(document).ready(function()
{
    const fmtStreamMapPattern = /"url_encoded_fmt_stream_map": "([^"]+)"/;

    var script = $('script:contains(\'url_encoded_fmt_stream_map\')')[0].text;
    var fmtStreamMap = fmtStreamMapPattern.exec(script)[1];
    var fmtUrlList = createFmtUrlList(fmtStreamMap);
    showDownloadLinks(fmtUrlList);
});

