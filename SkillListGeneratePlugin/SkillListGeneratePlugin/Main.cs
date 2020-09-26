using BepInEx;
using HarmonyLib;
using Oc;
using Oc.Skills;
using SR;
using System.IO;
using System.Reflection;
using System.Text;

namespace SkillListGeneratePlugin
{
    [BepInPlugin(PluginGuid, PluginName, PluginVersion)]
    public class Main : BaseUnityPlugin
    {
        private const string PluginGuid = "me.rin_jugatla.craftopia.mod.SkillListGeneratePlugin";
        private const string PluginName = "SkillListGeneratePlugin";
        private const string PluginVersion = "1.0.0";

        private const string SkillLogFilepath = @".\Log\SkillList:LANGUAGE.tsv";

        void Awake()
        {
            Harmony.CreateAndPatchAll(Assembly.GetExecutingAssembly());
        }

        /// <summary>
        /// スキルリストをログファイルに出力
        /// </summary>
        [HarmonyPatch(typeof(OcSkillManager), "Start")]
        public class OcSkillManagerLogger
        {
            static void Postfix(OcSkillManager __instance)
            {
                if (!Directory.Exists("Log"))
                    Directory.CreateDirectory("Log");

                // 出力する言語
                string[] language = new string[] { "English", "Chinese (Simplified)", "Japanese" };
                string[] filepathFix = new string[] { "En", "Cn", "Jp" };

                string header = "ID\tCategory\tCategoryName\tTier\tSkillName\tMaxLevel\tDescription\tIconName";
                for (int i = 0; i < language.Length; i++)
                {
                    LanguageManager.ChangeLanguage(language[i]);
                    SoSkillDataList skillList = Traverse.Create(__instance).Field("skillList").GetValue<SoSkillDataList>();
                    OcSkill[] skills = skillList.GetAll();

                    using (StreamWriter sw = new StreamWriter(SkillLogFilepath.Replace(":LANGUAGE", filepathFix[i]), false, Encoding.UTF8))
                    {
                        sw.WriteLine(header);
                        foreach (var skill in skills)
                        {
                            // 未実装のスキルは飛ばす
                            if (skill.Category == OcPlSkillCategory.None)
                                continue;

                            sw.WriteLine($"{skill.ID}\t{skill.Category}\t{skill.SkillCategoryName}\t{skill.Tier}\t{skill.SkillName}\t{skill.MaxLevel}\t{skill.OriginDesc}\t{skill.SkillIcon.name}");
                        }
                    }
                }
            }
        }
    }
}
