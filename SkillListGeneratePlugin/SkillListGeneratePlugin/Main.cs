using BepInEx;
using HarmonyLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace SkillListGeneratePlugin
{
    [BepInPlugin(PluginGuid, PluginName, PluginVersion)]
    public class Main
    {
        private const string PluginGuid = "me.rin_jugatla.craftopia.mod.ItemListGenerater";
        private const string PluginName = "ItemListGenerater";
        private const string PluginVersion = "1.0.0";

        void Awake()
        {
            UnityEngine.Debug.Log($"{PluginName} : {PluginVersion}");
            Harmony.CreateAndPatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
