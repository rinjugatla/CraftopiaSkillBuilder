var json;

$(function () {
    $.getJSON('skilltree.json', function (data) {
        json = data;
        var div_tree = $('#skilltree');
        var tree_length = data.length;

        for (var i = 0; i < tree_length; i++) {
            var tree = data[i].key;
            var tiers_length = data[i]['data']['tiers'].length;
            for (var j = 0; j < tiers_length; j++) {
                var tier = j + 1;
                var tier_limit = data[i]['data']['tiers'][j]['limit'];
                var tree_tier_header = `tree${tree}_tier${tier}`;
                // Tierヘッダ
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text(`Tier ${tier}: `));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_count` }).text('0'));
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text('/'));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_limit` }).text(tier_limit));
                // Tier画像等
                var div_table = ($('<div>').attr({ 'class': 'table' }));
                var table = ($('<table>'));
                var table_tr_name = ($('<tr>').attr({ 'class': 'name' }));
                var table_tr_icon = ($('<tr>').attr({ 'class': 'icon' }));
                var table_tr_level = ($('<tr>').attr({ 'class': 'level' }));
                var table_tr_level_td;

                var skills_length = data[i]['data']['tiers'][j]['skills'].length;
                for (var k = 0; k < skills_length; k++) {
                    // Tier内スキル情報
                    var skill = data[i]['data']['tiers'][j]['skills'][k];
                    // 名前追加
                    table_tr_name.append($('<td>').text(`${skill.name}`));
                    // アイコン追加
                    table_tr_icon.append($('<td>').append($('<img>').attr({ 'id': `${tree_tier_header}_${skill.key}`, 'class': `${tree_tier_header}_img`, 'src': `./img/${tree}/${skill.key}.png` })))
                    // 取得状況
                    table_tr_level_td = $('<td>').append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_count` }).text('0'));
                    table_tr_level_td.append($('<span>').text(' / '));
                    table_tr_level_td.append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_limit` }).text(`${skill.max}`));
                    table_tr_level.append(table_tr_level_td);
                }

                table.append(table_tr_name);
                table.append(table_tr_icon);
                table.append(table_tr_level);
                div_table.append(table);
                div_tree.append(div_table);
                div_tree.append('<br>');
            }
        }
    });
});

$(window).on('load', function () {

    var tree_length = json.length;
    for(var i = 0; i < tree_length; i++)
    {
        var tree = json[i].key;
        var tiers_length = json[i]['data']['tiers'].length;
        for(var j = 0; j < tiers_length; j++)
        {
            var tier = j + 1;
            var tree_tier_header = `tree${tree}_tier${tier}`;
            $(`.${tree_tier_header}_img`).on('click contextmenu', function (e) {
                var this_tier = $(this).attr('class').match(/[\d]+/); // 要素のtier取得
                var this_tree_tier_header = $(this).attr('class').replace('_img', '');
                var this_tree_tier_skill_header = $(this).attr('id');
                
                if(this_tier > 1)
                {
                    // tier1以降の場合は前のtierで条件をクリアしているか検証
                    var tree_tier_header_prev = `tree${tree}_tier${this_tier-1}`;
                    var count_prev = $(`#${tree_tier_header_prev}_count`);
                    var limit_prev = $(`#${tree_tier_header_prev}_limit`);
                    if(count_prev.text() < limit_prev.text())
                        return false;
                }

                // tierのカウント
                var count = $(`#${this_tree_tier_header}_count`);
                // スキルのカウント
                var skill_count = $(`#${this_tree_tier_skill_header}_count`);
                var skill_limit = $(`#${this_tree_tier_skill_header}_limit`);
                if(e.which == 1)
                {
                    // 左クリック
                    // スキルレベルが最大の場合は変更しない
                    if(skill_count.text() == skill_limit.text())
                        return false;
                    skill_count.text(Number(skill_count.text())+1);
                    count.text(Number(count.text())+1);
                }            
                else if(e.which == 3 && Number(skill_count.text()) > 0)
                {
                    // 右クリック
                    skill_count.text(Number(skill_count.text())-1);
                    count.text(Number(count.text())-1);
                    // 

                }
        
                return false;
            });
        }
    }
    
    // $('.treeA_tier1_img').on('click contextmenu', function (e) {
    //     // tierのカウント
    //     var count = $('#treeA_tier1_count');
    //     // スキルのカウント
    //     var skill_count = $(`#${$(this).attr('id')}_count`);
    //     var skill_limit = $(`#${$(this).attr('id')}_limit`);
        
    //     if(e.which == 1)
    //     {
    //         // 左クリック
    //         // スキルレベルが最大の場合は変更しない
    //         if(skill_count.text() == skill_limit.text())
    //             return false;
    //         skill_count.text(Number(skill_count.text())+1);
    //         count.text(Number(count.text())+1);
    //     }            
    //     else if(e.which == 3 && Number(skill_count.text()) > 0)
    //     {
    //         // 右クリック
    //         skill_count.text(Number(skill_count.text())-1);
    //         count.text(Number(count.text())-1);
    //     }

    //     return false;
    // });

    // $('.treeA_tier2_img').on('click contextmenu', function (e) {
    //     var count_prev = $('#treeA_tier1_count');
    //     var limit_prev = $('#treeA_tier1_limit');
    //     if(count_prev.text() < limit_prev.text())
    //         return false;

    //     var count = $('#treeA_tier2_count');
    //     if(e.which == 1)
    //         count.text(Number(count.text())+1);
    //     else if(e.which == 3 && count.text() > 0)
    //         count.text(Number(count.text())-1);

    //     // return false;
    // });


    // $('img#tier1_a').on({
    //     //ひとつ目のイベントハンドラ
    //     'mouseenter': function () {
    //         alert("マウスオーバーされました");
    //     },
    //     //ふたつ目のイベントハンドラ
    //     'mouseleave': function () {
    //         alert("マウスアウトされました");
    //     }
    // });

});




