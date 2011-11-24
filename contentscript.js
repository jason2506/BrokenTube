function showDownloadLinks(fmtUrlList)
{
    const fmtText = {
        '5'  : 'Download (FLV, 400 x 240, Mono 44KHz MP3)',
        '6'  : 'Download (FLV, 480 x 270, Mono 44KHz MP3)',
        '34' : 'Download (FLV, 640 x 360, Stereo 44KHz AAC)',
        '35' : 'Download (FLV, 854 x 480, Stereo 44KHz AAC)',

        '13' : 'Download (3GP, 176 x 144, Stereo 44KHz AAC)',
        '17' : 'Download (3GP, 176 x 144, Stereo 44KHz AAC)',

        '18' : 'Download (MP4, 640 x 360, Stereo 44KHz AAC)',
        '22' : 'Download (MP4, 1280 x 720, Stereo 44KHz AAC)',
        '37' : 'Download (MP4, 1920 x 1080, Stereo 44KHz AAC)',
        '38' : 'Download (MP4, 4096 x 3072, Stereo 44KHz AAC)',

        '83' : '[3D] Download (MP4, 850 x 240, Stereo 44KHz AAC)',
        '82' : '[3D] Download (MP4, 640 x 360, Stereo 44KHz AAC)',
        '85' : '[3D] Download (MP4, 1920 x 520, Stereo 44KHz AAC)',
        '84' : '[3D] Download (MP4, 1280 x 720, Stereo 44KHz AAC)',

        '43' : 'Watch online (WebM, 640 x 360, Stereo 44KHz Vorbis)',
        '44' : 'Watch online (WebM, 854 x 480, Stereo 44KHz Vorbis)',
        '45' : 'Watch online (WebM, 1280 x 720, Stereo 44KHz Vorbis)',

        '100': '[3D] Watch online (WebM, 640 x 360, Stereo 44KHz Vorbis)',
        '101': '[3D] Watch online (WebM, 854 x 480, Stereo 44KHz Vorbis)',
        '46' : '[3D] Watch online (WebM, 1920 x 540, Stereo 44KHz Vorbis)',
        '102': '[3D] Watch online (WebM, 1280 x 720, Stereo 44KHz Vorbis)'
    };

    fmtUrlList.sort(function (a, b)
    {
        return a.itag - b.itag;
    });

    var links = $('<ul>').attr({
        id: 'download-list',
        style: 'display: none; margin-bottom: 10px'
    });

    for (var index in fmtUrlList)
    {
        var text = fmtText[fmtUrlList[index].itag];
        links = links.append('<li><a href="' + fmtUrlList[index].url + '">' + text + '</a></li>');
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

function parseVideoInfo(videoInfo)
{
    const fmtStreamMapPattern = /url_encoded_fmt_stream_map=([^&]+)/;
    const fmtUrlParrern = /url=([^&]+)/;
    const fmtITagParrern = /itag=(\d+)/;

    var fmtStreamMap = unescape(fmtStreamMapPattern.exec(videoInfo)[1]);
    var fmtStreamList = fmtStreamMap.split(',');

    var fmtUrlList = new Array();
    for (var index in fmtStreamList)
    {
        var urlMatch = fmtUrlParrern.exec(fmtStreamList[index]);
        var itagMatch = fmtITagParrern.exec(fmtStreamList[index]);
        fmtUrlList.push({
            url: unescape(urlMatch[1]),
            itag: itagMatch[1]
        });
    }
    console.log(fmtUrlList);

    return fmtUrlList;
}

$(document).ready(function()
{
    videoInfo = $('#movie_player').attr('flashvars');
    fmtUrlList = parseVideoInfo(videoInfo);
    showDownloadLinks(fmtUrlList);
});

