let qt = null;
let colorMap = new Map(legoColors.filter(c => c.material == 'Solid').map(c => {
    let lab = rgb2lab([c.r, c.g, c.b]);
    c.l = lab[0];
    c.a = lab[1];
    c.b = lab[2];
    return [c.legoId, c]
}))




function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function colorDifference(c1, c2) {
    rbar = (c1[0] + c2[0]) / 2.0;
    dc = Math.sqrt(
        (2.0 + rbar / 256.0) * Math.pow(c2[0] - c1[0], 2)
        + 4.0 * Math.pow(c2[1] - c1[1], 2)
        + (2.0 + (255.0 - rbar) / 256.0) * Math.pow(c2[2] - c1[2], 2)
    );
    return dc;
}


$( document ).ready( function() {

    $("#ref-color-input").bind('keyup', function(event) {
        let e = $( event.target );
        $("#frm-submit").attr('disabled', e.val().match( /^#[0-9a-fA-F]{6}$/) ? null : 'true')
    } );

    var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    let refColor = getParameterByName('ref_color');
    if(refColor === null || refColor === '') { 
        refColor = randomColor
    }
    let refRgb = $.parseColor(refColor);
    console.log('RefRGB: ' + refRgb);
    let refLab = rgb2lab(refRgb);
    console.log(refColor + " " + refRgb);

    let lc = legoColors.filter(c => c.material == 'Solid').map(c => {
        xrgb = $.parseColor('#' + c.hex);
        let lab = rgb2lab([xrgb[0], xrgb[1], xrgb[2]]);
        c.cl = lab[0];
        c.ca = lab[1];
        c.cb = lab[2];
        // c.d = colorDifference([c.r, c.g, c.b], refRgb)
        c.d = deltaE(lab, refLab);
        console.log(c.legoId + ' ' + c.legoName + ': ' + lab + ' vs ' + refLab);
        return c
    }).sort((a, b) => a.d - b.d);
    
    $( "#ref-color-block" ).css( 'background-color', refColor );
    $( "#ref-color-header" ).text( refColor );

    // $( "#table-container" ).text( colorMap );
    let content = [];
    content.push(
        '<table class="table"><thead><tr>',
        '<th>Ref</th><th colspan="2">Color</th>',
        '<th>Lego ID</th><th>Lego Name</th><th>Hex</th>',
        '<th>&Delta;E</th>',
        '</tr></thead>',
        '<tbody>'
    )
    lc.forEach( function(value) {
        content.push(
            '<tr>',
            '<td>',
            '<div class="color-block" style="background-color: ',
            refColor,
            ';">&nbsp;</div>',
            '</td>',
            '<td>',
            '<div class="color-block" style="background-color: #',
            value.hex.toUpperCase(),
            ';">&nbsp;</div>',
            '</td>',
            '<td>',
            '<img src="images/',
            value.legoId,
            '_32x.png" />',
            '</td>',
            '<td>',
            value.legoId,
            '</td>',
            '<td>',
            value.legoName,
            '</td>',
            '<td>',
            ['#', value.hex].join(''),
            '</td>',
            '<td>',
            value.d,
            '</td>',
            '</tr>'
        );
    });
    content.push(
        '</tbody></table>'
    );
    $( "#table-container" ).html( content.join('') );
} )
