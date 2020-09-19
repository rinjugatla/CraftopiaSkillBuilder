let json;
let skill_assigment = {}; // スキル割り当て状況

const max_skill_point = 50;
const skill_column_count = 5; // 横に並べるスキルの数
const skilltree_id_header = 'skilltree';
const header_count = 'count_header';
const header_limit = 'limit_header';

// アルファベットから数字を取得
// https://qiita.com/jun910/items/fca533808b7f20ff9d21
function ABCConvertToInt(c) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let upper = c.toUpperCase();
    return alphabet.indexOf(upper);
}

// スキル割り当て状況の文字列を作成
function ExportSkillAssigmentString(){
    // 書式 Aaa1Aac2Baa6
    let result = '';
    for(let tree_key in skill_assigment){
        for(let skill_key in skill_assigment[tree_key]){
            if(skill_assigment[tree_key][skill_key] != 0)
                result += (tree_key+skill_key+skill_assigment[tree_key][skill_key]);
        }
    }
}

// タグ作成
$(function () {
    $.getJSON('skilltree.json', function (data) {
        json = data;
        let tree_length = data.length;
        for (let i = 0; i < tree_length; i++) {
            let tree = data[i].key;
            let tree_name = data[i].name;
            // スキル割り当て状況にスキルツリーを追加
            skill_assigment[tree] = {};
            // スキルツリータブ
            let skill_tab = $('<li>').append($('<a>').attr({'href': `#${skilltree_id_header}${tree}`}).text(tree_name));
            // スキルツリー内容
            let div_tree = ($('<div>').attr({'id': `${skilltree_id_header}${tree}`, 'class': 'tab_contents'}));
            if(i == 0){
                skill_tab.addClass('current');
                div_tree.addClass('current');
            }
            $('#skill_tabs').append(skill_tab); 
            
            let tiers_length = data[i]['data']['tiers'].length;
            for (let j = 0; j < tiers_length; j++) {
                let tier = j + 1;
                let tier_limit = data[i]['data']['tiers'][j]['limit'];
                let tree_tier_header = `tree${tree}_tier${tier}`;
                // Tierヘッダ
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text(`Tier ${tier}: `));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_${header_count}` }).text('0'));
                div_tree.append($('<span>').attr({ 'class': 'tree' }).text('/'));
                div_tree.append($('<span>').attr({ 'class': 'tree', 'id': `${tree_tier_header}_${header_limit}` }).text(tier_limit));
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

                    // スキルツリー割り当て状況にスキルを追加
                    skill_assigment[tree][skill.key] = 0;
                    
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
            // スキル情報をdivタグに追加
            $('#skilltrees').append(div_tree);
        }
    });
});

$(window).on('load', function () {
    // 値設定
    $('#point_left').text(max_skill_point);

    // タブの動作
    $(".skill_tabs a").click(function () {
        $(this).parent().addClass("current").siblings(".current").removeClass("current");
        var tabContents = $(this).attr("href");
        $(tabContents).addClass("current").siblings(".current").removeClass("current");
        return false;
    });

    // イベント追加
    $(`.skill_img`).on({
        'click contextmenu': function (e) {
            // アイコン左クリックでスキルレベル上昇、右クリックでレベルダウン
            let this_tree = $(this).attr('id').match(/[A-Z]/)[0]; // ツリー
            let this_tier = $(this).attr('id').match(/[\d]+/)[0]; // tier
            let this_key = $(this).attr('id').match(/[a-z]{2}$/)[0]; // skill key
            let this_tree_tier_header = `tree${this_tree}_tier${this_tier}`;
            let this_tree_tier_skill_header = $(this).attr('id');
            
            if(this_tier > 1)
            {
                // tier1以降の場合は前のtierで条件をクリアしているか検証
                let tree_tier_header_prev = `tree${this_tree}_tier${this_tier-1}`;
                let count_prev = $(`#${tree_tier_header_prev}_${header_count}`);
                let limit_prev = $(`#${tree_tier_header_prev}_${header_limit}`);
                if(count_prev.text() < limit_prev.text())
                    return false;
            }
    
            // tierのカウント
            let count = $(`#${this_tree_tier_header}_${header_count}`);
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

                skill_assigment[this_tree][this_key]+=1;
                skill_count.text(Number(skill_count.text())+1);
                count.text(Number(count.text())+1);
                $('#point_left').text(Number($('#point_left').text())-1); // 残りスキルポイント
                ExportSkillAssigmentString();
            }            
            else if(e.which == 3 && Number(skill_count.text()) > 0)
            {
                // 右クリック
                skill_assigment[this_tree][this_key]-=1;
                skill_count.text(Number(skill_count.text())-1);
                count.text(Number(count.text())-1);
                $('#point_left').text(Number($('#point_left').text())+1); // 残りスキルポイント
                ExportSkillAssigmentString();
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

    // 残りスキルポイントの色
    $(`#point_left`).on({
        'DOMSubtreeModified propertychange': function () {
            if($(this).text() == '0')
                $(this).attr({'class': 'no_point'});
            else
                $(this).attr({'class': ''});
        }
    });

    // Tierタイトルの色
    $(`[id$=count_header]`).on({
        'DOMSubtreeModified propertychange': function () {
            let limit_header = $(`#${$(this).attr('id').replace(header_count, header_limit)}`);
            if(Number($(this).text()) >= Number(limit_header.text()))
                $(this).attr({'class': 'allow_next_tier'});
            else
                $(this).attr({'class': ''});
        }
    });
});




