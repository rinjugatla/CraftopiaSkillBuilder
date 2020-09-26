const allow_skilltree_version = ['v1']; // 許可するスキルツリーバージョン
const latest_skilltree_version = allow_skilltree_version.slice(-1)[0]; // 最新のスキルツリーバージョン
const max_skill_point = 49; // 最大スキルポイント
const skill_column_count = 10; // 横に並べるスキルの数
const skilltree_id_header = 'skilltree';
const header_count = 'count_header';
const header_limit = 'limit_header';
const default_language = 'jp';
const allow_language = ['jp', 'en', 'cn']; // 許可する言語設定
const alphabet = "abcdefghijklmnopqrstuvwxyz";

let json;
let skill_assigment = {}; // スキル割り当て状況
let language = default_language;

// アルファベットから数字を取得
// https://qiita.com/jun910/items/fca533808b7f20ff9d21
function ABCConvertToInt(c) {
    let lower = c.toLowerCase();
    return alphabet.indexOf(lower);
}
// スキルキー(aa, bdなど)から数字を取得
function SkillKeyConvertToInt(skill_key){
    first = ABCConvertToInt(skill_key.charAt(0));
    second = ABCConvertToInt(skill_key.charAt(1));
    return first * 26 + second;
}

// URLパラメーターを取得し辞書に格納
// https://qiita.com/tonkatu_tanaka/items/99d167ded9330dbc4019
let args = {};
function ImportArgs(){
    let pairs=location.search.substring(1).split('&');
    for(let i=0;pairs[i];i++) {
        let kv = pairs[i].split('=');
        args[kv[0]]=kv[1];
    }
}

// スキル割り当て状況の文字列を作成
function ExportSkillAssigmentString(){
    // 書式 A1aa3A2ac2Baa6 TreeKey+Tier+SkillKey+SkillLevel
    let result = '';
    for(let tree_key in skill_assigment)
        for(let tier_key in skill_assigment[tree_key])
            for(let skill_key in skill_assigment[tree_key][tier_key])
                if(skill_assigment[tree_key][tier_key][skill_key] != 0)
                    result += (tree_key+tier_key+skill_key+skill_assigment[tree_key][tier_key][skill_key]);
    return result;
}

// スキル割り当て文字列からDOMに反映
function ImportSkillAssigmentString(){
    if(args['skills']){
        let assigment = args['skills'];
        RestoreSkillAssigment(assigment);
        AssigmentToDOM();
    }
}
// スキル割り当て文字列からスキル割り当て状況を復元
function RestoreSkillAssigment(assigment){
    let assigment_split = assigment.match(/.{5}/g);
    for(let i = 0; i < assigment_split.length; i++){
        let tree_key = assigment_split[i].charAt(0);
        let tier_key = assigment_split[i].charAt(1);
        let skill_key = assigment_split[i].substring(2,4);
        let level = Number(assigment_split[i].charAt(4));
        skill_assigment[tree_key][tier_key][skill_key] = level;
    }
}
// DOMにスキル割り当て状況を反映
function AssigmentToDOM(){
    let total_point = 0; // 使用済み合計ポイント
    for(let tree_key in skill_assigment)
        for(let tier_key in skill_assigment[tree_key]){
            let tier_point = 0;
            for(let skill_key in skill_assigment[tree_key][tier_key]){
                $(`#tree${tree_key}_tier${tier_key}_${skill_key}_count`).text(skill_assigment[tree_key][tier_key][skill_key]);
                tier_point += skill_assigment[tree_key][tier_key][skill_key];
                total_point += skill_assigment[tree_key][tier_key][skill_key];
            }
            // tierに振ったポイントを復元
            $(`#tree${tree_key}_tier${tier_key}_count_header`).text(tier_point);
        }
    // 残りポイントを復元
    $('#point_left').text(max_skill_point - total_point);
}

// タグ作成に使用するjsonファイルパスをURLパラメータから取得
// todo: ファイルが存在しない場合の処理
function GetSkilltreeFilepath(){
    let result = './skilltree/:version.json';
    result = result.replace(':version', latest_skilltree_version);
    if(args['v'] && allow_skilltree_version.includes(args['v']))
        result = result.replace(':version', args['v']);
    return result;
}

// URLパラメータから言語設定を取得
function SetLanguage(){
    language = default_language;
    if(args['lang'] && allow_language.includes(args['lang']))
        language = args['lang'];
}

// URLをパラメータ付きで更新
function UpdateURL(){
    let url = new URL(location);
    url.searchParams.set('v', latest_skilltree_version);
    url.searchParams.set('lang', language);
    url.searchParams.set('skills', ExportSkillAssigmentString());
    history.replaceState(null, null, url);
}

$(function () {
    ImportArgs();
    SetLanguage();

    // タグ作成
    let json_filepath = GetSkilltreeFilepath();
    $.getJSON(json_filepath, function (data) {
        json = data;
        let tree_length = data.length;
        for (let i = 0; i < tree_length; i++) {
            let tree = data[i]['key'];
            let tree_name = data[i]['name'][language];
            // スキル割り当て状況にスキルツリーを追加
            skill_assigment[tree] = {};
            // スキルツリータブ
            let skill_tab = $('<li>').append($('<a>').attr({'href': `#${skilltree_id_header}${tree}`}).text(`${tree_name}`)
                .append($('<span>').text(' ('))
                .append($('<span>').attr({'id': `tree${tree}_count`}).text('0'))
                .append($('<span>').text(')')));
            // スキルツリー内容
            let div_tree = ($('<div>').attr({'id': `${skilltree_id_header}${tree}`, 'class': 'tab_contents'}));
            if(i == 0){
                skill_tab.addClass('current');
                div_tree.addClass('current');
            }
            $('#skill_tabs').append(skill_tab); 
            
            let tiers_length = data[i]['tiers'].length;
            for (let j = 0; j < tiers_length; j++) {
                let tier = j + 1;
                let tier_limit = data[i]['tiers'][j]['limit'];
                let tree_tier_header = `tree${tree}_tier${tier}`;
                // スキルツリー割り当て状況にtierを追加
                skill_assigment[tree][tier] = {};

                // Tierヘッダ
                div_tree.append($('<span>').attr({ 'class': 'header' }).text(`Tier ${tier}: `));
                div_tree.append($('<span>').attr({ 'class': 'header', 'id': `${tree_tier_header}_${header_count}` }).text('0'));
                div_tree.append($('<span>').attr({ 'class': 'header' }).text('/'));
                div_tree.append($('<span>').attr({ 'class': 'header', 'id': `${tree_tier_header}_${header_limit}` }).text(tier_limit));
                // Tier画像等
                let div_table = ($('<div>').attr({ 'class': 'table' }));
                let table = ($('<table>'));
                let table_tr_name = ($('<tr>').attr({ 'class': 'skill_name' }));
                let table_tr_icon = ($('<tr>').attr({ 'class': 'skill_icon' }));
                let table_tr_level = ($('<tr>').attr({ 'class': 'skill_level' }));
                let table_tr_level_td;

                let skills_length = data[i]['tiers'][j]['skills'].length;
                for (let k = 0; k < skills_length; k++) {
                    // Tier内スキル情報
                    let skill = data[i]['tiers'][j]['skills'][k];

                    // スキルツリー割り当て状況にスキルを追加
                    skill_assigment[tree][tier][skill.key] = 0;
                    
                    // 名前追加
                    table_tr_name.append($('<td>').text(`${skill['name'][language]}`));
                    // アイコン追加
                    table_tr_icon.append($('<td>').append($('<img>').attr({ 'id': `${tree_tier_header}_${skill.key}`, 'class': `skill_img skill_lock`, 'src': `./img/skills/${skill.icon}` })))
                    // 取得状況
                    table_tr_level_td = $('<td>').append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_count`, 'class': 'skill_point_count' }).text('0'));
                    table_tr_level_td.append($('<span>').text(' / '));
                    table_tr_level_td.append($('<span>').attr({ 'id': `${tree_tier_header}_${skill.key}_limit`, 'class': 'skill_point_limit' }).text(`${skill.max}`));
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
    
    // 各種イベントを追加
    AddDOMEvent();
    
});

// イベント追加
function AddDOMEvent(){
    AddSkillLevelUpEvent();
    AddSkillLevelDownEvent();
    AddShowSkillDescriptionEvent()
    AddHideSkillDescriptionEvent();
    AddChangeSkillColorEvent();
    AddChangeColorTierCountEvent();
    AddChangePointLeftColorEvent();
    AddChangeTabEvent();
    AddChangeLanguageEvent();
}

// スキルレベルを上げるイベントを追加
function AddSkillLevelUpEvent(){
    $(document).on('click', '.skill_img', function () {
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
            if(Number(count_prev.text()) < Number(limit_prev.text()))
                return false;
        }

        // tierのカウント
        let count = $(`#${this_tree_tier_header}_${header_count}`);
        // スキルのカウント
        let skill_count = $(`#${this_tree_tier_skill_header}_count`);
        let skill_limit = $(`#${this_tree_tier_skill_header}_limit`);

        // 残りスキルポイントがない場合は処理しない
        if($('#point_left').text() == 0)
            return;

        // 左クリック
        // スキルレベルが最大の場合は変更しない
        if(skill_count.text() == skill_limit.text())
            return false;

        skill_assigment[this_tree][this_tier][this_key]+=1;
        skill_count.text(Number(skill_count.text())+1);
        count.text(Number(count.text())+1);
        $('#point_left').text(Number($('#point_left').text())-1); // 残りスキルポイント
        
        UpdateURL();

        return false;
    });
}

// スキルレベルを下げるイベントを追加
function AddSkillLevelDownEvent(){
    $(document).on('contextmenu', '.skill_img', function () {
        let this_tree = $(this).attr('id').match(/[A-Z]/)[0]; // ツリー
        let this_tier = $(this).attr('id').match(/[\d]+/)[0]; // tier
        let this_key = $(this).attr('id').match(/[a-z]{2}$/)[0]; // skill key
        let this_tree_tier_header = `tree${this_tree}_tier${this_tier}`;
        let this_tree_tier_skill_header = $(this).attr('id');
    
        // tierのカウント
        let count = $(`#${this_tree_tier_header}_${header_count}`);
        // スキルのカウント
        let skill_count = $(`#${this_tree_tier_skill_header}_count`);
        let skill_limit = $(`#${this_tree_tier_skill_header}_limit`);

        if(skill_count.text() == '0')
            return false;

        // 右クリック
        skill_assigment[this_tree][this_tier][this_key]-=1;
        skill_count.text(Number(skill_count.text())-1);
        count.text(Number(count.text())-1);
        $('#point_left').text(Number($('#point_left').text())+1); // 残りスキルポイント

        UpdateURL();

        return false;
    });
}

// スキル説明を表示するイベントを追加
function AddShowSkillDescriptionEvent(){
    $(document).on('mouseenter', '.skill_img', function () {
        // アイコンにマウスオーバした際に説明文を表示
        let this_tree_num = ABCConvertToInt($(this).attr('id').match(/[A-Z]/)[0]);
        let this_tier = $(this).attr('id').match(/[\d]+/)[0]; // 配列インデックスとずれているため注意
        let this_skill_num = SkillKeyConvertToInt($(this).attr('id').match(/([a-z]{2})$/)[0]);
        let description = json[this_tree_num]['tiers'][this_tier - 1]['skills'][this_skill_num]['description'][language];
        $('#description').text(description);
    });
}

// スキル説明を非表示にするイベントを追加
function AddHideSkillDescriptionEvent(){
    $(document).on('mouseleave', '.skill_img', function () {
        // マウスオーバ解除で説明文を初期化
        $('#description').text('');
    });
}

// スキルの色を変えるイベントを追加
function AddChangeSkillColorEvent(){
    // スキルアイコンの色
    $(document).on('DOMSubtreeModified propertychange', '.skill_point_count', function () {
        let img_id = $(this).attr('id').replace('_count', '');
        if($(this).text() == '0')
            $(`#${img_id}`).addClass('skill_lock');
        else
            $(`#${img_id}`).removeClass('skill_lock');
    });
}

// スキルTierのポイントの色を変えるイベントを追加
function AddChangeColorTierCountEvent(){
    $(document).on('DOMSubtreeModified propertychange', '[id$=count_header]', function () {
        // スキルTierのポイントの色制御
        let limit_header = $(`#${$(this).attr('id').replace(header_count, header_limit)}`);
        if(Number($(this).text()) >= Number(limit_header.text()))
            $(this).addClass('allow_next_tier');
        else
            $(this).removeClass('allow_next_tier');

        // ツリータイトルのスキルポイントの更新
        UpdateTreeSkillPoint($(this));
    });
}

// ツリータイトルのスキルポイントの更新
function UpdateTreeSkillPoint(tag){
    // 書き換え操作の際に一度内容を空にしてから代入するため、値が入ってくるまでは処理を行わない
    if(tag.text() == '')
        return;

    let tree_key = tag.attr('id').match(/[A-Z]/)[0];
    let skilltiers = $(`#skilltree${tree_key} > span[id$=count_header]`);
    let total = 0;
    for(let i = 0; i < skilltiers.length; i++)
        total += Number(skilltiers[i].innerText);
    $(`#tree${tree_key}_count`).text(total);
}

// 残りスキルポイントの色を変えるイベントを追加
function AddChangePointLeftColorEvent(){
    $(document).on('DOMSubtreeModified propertychange', '#point_left', function () {
        if($(this).text() == '0')
            $(this).addClass('no_point');
        else
            $(this).removeClass('no_point');
    });
}

// タブ切り替えイベントを追加
function AddChangeTabEvent(){
    $(document).on('click', '.skill_tabs a', function () {
        $(this).parent().addClass("current").siblings(".current").removeClass("current");
        var tabContents = $(this).attr("href");
        $(tabContents).addClass("current").siblings(".current").removeClass("current");
        return false;
    });
}

// 言語変更イベントの追加
function AddChangeLanguageEvent(){
    $(document).on('click', '.language_header img', function () {
            language = $(this).attr('src').match(/([a-z]{2}).svg/)[1];
            UpdateURL();
            location.reload();
    });
}

$(window).on('load', function () {
    // 値設定
    $('#point_left').text(max_skill_point);

    // URLパラメータからスキル割り当て状況を復元
    ImportSkillAssigmentString();
});