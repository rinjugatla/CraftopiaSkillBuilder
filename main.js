let json;

const max_skill_point = 50;
const skill_column_count = 5; // 横に並べるスキルの数

// アルファベットから数字を取得
// https://qiita.com/jun910/items/fca533808b7f20ff9d21
function ABCConvertToInt(c) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let upper = c.toUpperCase();
    return alphabet.indexOf(upper);
}

// タグ作成
$(function () {
    $.getJSON('skilltree.json', function (data) {
        json = data;
        let div_tree = $('#skilltree');
        let tree_length = data.length;

        for (let i = 0; i < tree_length; i++) {
            let tree = data[i].key;
            let tiers_length = data[i]['data']['tiers'].length;
            for (let j = 0; j < tiers_length; j++) {
                let tier = j + 1;
                let tier_limit = data[i]['data']['tiers'][j]['limit'];
                let tree_tier_header = `tree${tree}_tier${tier}`;
                // Tierヘッダ
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text(`Tier ${tier}: `));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_count` }).text('0'));
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text('/'));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_limit` }).text(tier_limit));
                // Tier画像等
                let div_table = ($('<div>').attr({ 'class': 'table' }));
                let table = ($('<table>'));
                let table_tr_name = ($('<tr>').attr({ 'class': 'name' }));
                let table_tr_icon = ($('<tr>').attr({ 'class': 'icon' }));
                let table_tr_level = ($('<tr>').attr({ 'class': 'level' }));
                let table_tr_level_td;

                let skills_length = data[i]['data']['tiers'][j]['skills'].length;
                for (let k = 0; k < skills_length; k++) {
                    // Tier内スキル情報
                    let skill = data[i]['data']['tiers'][j]['skills'][k];
                    // 名前追加
                    table_tr_name.append($('<td>').text(`${skill.name}`));
                    // アイコン追加
                    table_tr_icon.append($('<td>').append($('<img>').attr({ 'id': `${tree_tier_header}_${skill.key}`, 'class': `skill_img`, 'src': `./img/${tree}/${skill.key}.png` })))
                    // 取得状況
                    table_tr_level_td = $('<td>').append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_count` }).text('0'));
                    table_tr_level_td.append($('<span>').text(' / '));
                    table_tr_level_td.append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_limit` }).text(`${skill.max}`));
                    table_tr_level.append(table_tr_level_td);

                    if(k != 0 && (k % (skill_column_count - 1) == 0))
                    {
                        // スキルアイコン等を1行分追加
                        table.append(table_tr_name);
                        table.append(table_tr_icon);
                        table.append(table_tr_level);
                        // 次行分を初期化
                        table_tr_name = ($('<tr>').attr({ 'class': 'name' }));
                        table_tr_icon = ($('<tr>').attr({ 'class': 'icon' }));
                        table_tr_level = ($('<tr>').attr({ 'class': 'level' }));
                    }
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
    // 値設定
    $('#point_left').text(max_skill_point);

    // イベント追加
    $(`.skill_img`).on({
        'click contextmenu': function (e) {
            // アイコン左クリックでスキルレベル上昇、右クリックでレベルダウン
            let this_tree = $(this).attr('id').match(/[A-Z]/)[0]; // ツリー
            let this_tier = $(this).attr('id').match(/[\d]+/)[0]; // tier
            let this_tree_tier_header = `tree${this_tree}_tier${this_tier}`;
            let this_tree_tier_skill_header = $(this).attr('id');
            
            if(this_tier > 1)
            {
                // tier1以降の場合は前のtierで条件をクリアしているか検証
                let tree_tier_header_prev = `tree${this_tree}_tier${this_tier-1}`;
                let count_prev = $(`#${tree_tier_header_prev}_count`);
                let limit_prev = $(`#${tree_tier_header_prev}_limit`);
                if(count_prev.text() < limit_prev.text())
                    return false;
            }
    
            // tierのカウント
            let count = $(`#${this_tree_tier_header}_count`);
            // スキルのカウント
            let skill_count = $(`#${this_tree_tier_skill_header}_count`);
            let skill_limit = $(`#${this_tree_tier_skill_header}_limit`);
            if(e.which == 1)
            {
                // 残りスキルポイントがない場合は処理しない
                if($('#point_left').text() == 0)
                    return;

                // 左クリック
                // スキルレベルが最大の場合は変更しない
                if(skill_count.text() == skill_limit.text())
                    return false;
                skill_count.text(Number(skill_count.text())+1);
                count.text(Number(count.text())+1);
                $('#point_left').text(Number($('#point_left').text())-1); // 残りスキルポイント
            }            
            else if(e.which == 3 && Number(skill_count.text()) > 0)
            {
                // 右クリック
                skill_count.text(Number(skill_count.text())-1);
                count.text(Number(count.text())-1);
                $('#point_left').text(Number($('#point_left').text())+1); // 残りスキルポイント
            }
    
            return false;
        },
        'mouseenter': function () {
            // アイコンにマウスオーバした際に説明文を表示
            let this_tree_num = ABCConvertToInt($(this).attr('id').match(/[A-Z]/)[0]);
            let this_tier = $(this).attr('id').match(/[\d]+/)[0]; // 配列インデックスとずれているため注意
            let this_skill_num = ABCConvertToInt($(this).attr('id').match(/([a-z])$/)[0]);
            let description = json[this_tree_num]['data']['tiers'][this_tier - 1]['skills'][this_skill_num]['description'];
            $('#description').text(description);
        },
        'mouseleave': function () {
            // マウスオーバ解除で説明文を初期化
            $('#description').text('');
        }

        
    });
});




