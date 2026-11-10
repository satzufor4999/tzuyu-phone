/**
 * FoundPhone Studio -> Tzuyu's iPhone.
 * Removes only the 26 app IDs explicitly excluded by the project owner.
 * Keep upstream MIT and attribution notices unchanged.
 */
import { readFile, writeFile } from "node:fs/promises";

export const REMOVED_IDS = [
  "douyin","maps","wallet","files","health","find","calculator",
  "qq","redbook","bilibili","alipay","taobao","netease","delivery",
  "forum","whatsapp","telegram","discord","youtube","line",
  "snapchat","facebook","messenger","reddit","netflix","pinterest"
];
const excluded = new Set(REMOVED_IDS);
const read = async p => await readFile(p,"utf8");
const edit = async (p, content) => await writeFile(p, content);

let registry = await read("src/registry.ts");
const needle = "export const registry: AppPlugin[] = definitions.map(";
if (!registry.includes(needle)) throw Error("Upstream registry changed; stop rather than silently ship excluded apps");
registry = registry.replace(needle, "export const registry: AppPlugin[] = definitions.filter(([id]) => !REMOVED.has(id)).map(");
registry = registry.replace("export const registry: AppPlugin[]", "const REMOVED = new Set(" + JSON.stringify(REMOVED_IDS) + ");\nexport const registry: AppPlugin[]");
await edit("src/registry.ts",registry);

for (const path of ["stories/template/story.json","stories/test-preview/story.json"]) {
  const data = JSON.parse(await read(path));
  const id = a => typeof a === "string" ? a : a.id;
  data.installedApps = data.installedApps.filter(a=>!excluded.has(id(a)));
  data.chats = (data.chats||[]).filter(c=>!excluded.has(c.app));
  for (const id of Object.keys(data.content||{})) if (excluded.has(id)) delete data.content[id];
  if (path.includes("template")) {
    data.id = "tzuyu-phone-foundphone";
    data.title = "Tzuyu's iPhone";
    data.description = "虚构粉丝互动手机";
    data.revision = (data.revision||1)+1;
    data.phone.owner = "Tzuyu";
    data.phone.passcode = "0614";
  }
  await edit(path,JSON.stringify(data,null,2)+"\n");
}

const check = JSON.parse(await read("stories/template/story.json"));
if (check.installedApps.some(a=>excluded.has(typeof a==="string"?a:a.id))) throw Error("Excluded app in home");
if (check.chats.some(c=>excluded.has(c.app))) throw Error("Excluded messaging app present");
console.log("Removed " + REMOVED_IDS.length + " excluded app IDs; remaining configured: " + check.installedApps.length);
