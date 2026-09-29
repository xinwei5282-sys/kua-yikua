# 夸一夸 · 移动端 UI 设计稿 v2

日期：2026-09-28

生成方式：内置 imagegen。图片设计稿已按后续“根据 UI 调整原型”要求同步到可运行原型。

## 设计稿

- [首页、我的夸夸、图片预览弹窗](ui-v2-creation-and-records.png)
- [我的、套餐、使用记录](ui-v2-account-and-plan.png)

## 本轮依据与检查

依据当前产品方案与本会话最新页面调整生成，最新明确的页面删除要求优先于早期方案。保留暖白、深绿和少量金色的视觉体系。

已目视核对：五类人群均可见；首页没有次数/套餐/空资料说明；我的夸夸没有数量说明；图片弹窗没有标题且完整位于手机边界内；我的页面只保留两项列表与次数卡片入口；套餐已精简且未填写虚构售价；使用记录按日期显示时间与次数变化。均无底部导航或原型说明。

首页在左侧头像旁补上“我的”文字，响应此前入口过于隐蔽的反馈；该处理已同步到首页代码。海报插图参考新版经过处理的照片合成方向，保持横向展示。

旧 ui-design-v1-2026-09-28.png 保留作为历史稿，不作为当前页面结构依据。

## 第一张提示词

Create a polished production-quality Chinese WeChat mini-program UI design board for “夸一夸”. This board contains EXACTLY THREE full mobile screens, equal size, arranged left to right: creation home, “我的夸夸” list, and that list with an image preview modal. Wide landscape board, very high resolution, prefer 2400x1600 or comparable. Each screen approximately 390x844 proportions, large readable Chinese typography. Use flat screen artboards, softly rounded outer corners, thin shadow, no physical device hardware, no perspective. Minimal neutral warm-beige outer background with narrow gutters. No presentation titles, annotations or arrows outside screens.
REFERENCE 1 is a finished LANDSCAPE poster to display as the completed image inside screen2 and screen3. Preserve its recognizable bread / sunlit desk / flower composition, title “你把日子，过出了光。” and 3:2 horizontal aspect. It is a compositing insert, NOT the app page layout.
REFERENCE 2 is the current homepage and defines existing brand, UI rhythm, green/ivory style. Improve precision and craftsmanship while preserving business structure.

Shared design system: warm ivory #FAF9F5, dark forest text #263B31, jade green #397C5F main buttons, subtle sage pills #E8EEE5, fine light-gray-green dividers, tiny gold sun logo. Editorial Chinese Songti headings, clear Chinese sans UI labels. Fine one-weight line icons. Crisp, restrained, generous breathing room. No gradients or decorative blobs. All screens have status bar 9:41, WeChat capsule upper right and small bottom home indicator. No bottom tab navigation.

SCREEN 1 — HOME:
Top bar LEFT: small round pale sage avatar with “叶”, followed by clearly visible “我的” text to make the account entry recognizable; brand “夸一夸” with little gold sun to its right; WeChat capsule independently at far right. Align all without collision.
Headline “这一刻，值得夸一夸”, last three characters jade green.
Subtitle “放张照片，说一句话。”
Five equally sized category pills, ONE row, exact names “宝妈” “职场人” “学生” “长辈” “日常”. 日常 selected sage.
Large image upload area showing the original PHOTO of hands breaking artisan bread in sunlight, from the bread image depicted in reference1 (no poster text in upload photo). Small white camera button “换照片” and small remove × over lower right.
Under image: small “3 张照片 · 最多 6 张” and right “＋ 添加照片”.
A short row of 3 small thumbnail photos: bread, sunlit desk with coffee, yellow flowers. These are separate original upload photos, not three copies of the poster.
Label “说说这一刻”.
Text input with exact “今天做了面包，泡了咖啡，也给窗边添了一束花。”
One prominent jade button “夸一夸，生成海报”.
Below button just breathing space and home indicator. Do not put remaining quota, per-use cost, package link, knowledge hint, “去了解” or any extra footer.

SCREEN 2 — RECORDS:
Top back chevron, centered “我的夸夸”, WeChat capsule.
Editorial heading broken into two lines “那些值得留下的，\n小小瞬间。”
No paragraph or record-count summary below this heading.
Filter pills “全部” selected / “制作中” / “已完成” / “未完成”.
Two beautifully aligned compact list entries separated by fine lines:
First entry a thumbnail of mother and daughter cycling; warm muted gold dot “正在制作 · 宝妈”; title “今天陪女儿学会了骑车”; small time “2026.09.28 14:32 提交”; small green line “预计约 5 分钟，可先离开”. No delete button for working entry.
Second entry shows a genuine tiny LANDSCAPE thumbnail of reference1's completed poster; green check “已完成 · 日常”; title “你把日子，过出了光。”; small “2026.09.28 14:20 提交”; unobtrusive “删除” at right bottom.
Keep the rest of the screen spacious. No independent full-screen generating view. No record-count sentence.

SCREEN 3 — IMAGE PREVIEW MODAL:
Exactly the same records screen as screen2 underneath a subtle sage-gray dimmed scrim with mild blur. Scrim and modal must be strictly INSIDE this phone's edges, never spill onto board or other phones.
Center a warm-white rounded modal at approximately middle height, width about 354px within 390px screen (18px side margins).
CRITICAL: modal has NO HEADING, NO TITLE, NO DESCRIPTION. Only a small × close button at its top right, then the COMPLETE 3:2 LANDSCAPE poster from reference1 displayed uncropped, clearly visible within modal width. The poster is the image content; do not replace it with original photo or portrait layout.
Under image two equal-width buttons: green outline download icon “下载图片”, filled jade share icon “分享”.
Modal height should only contain close control, landscape image and buttons, with elegant 16px padding. It must not exceed phone width or height.

ABSOLUTE CONTENT CONSTRAINTS:
No “原型”, “演示”, “示例”, “本机”, implementation descriptions or designer annotations anywhere.
Never reintroduce “本次使用”, “可用2次”, “查看套餐” on home.
Never include “没有个人资料，也可以直接开始”, “去了解”, “已经留下 2 份记录。每一份，都属于你。”.
Never add the removed preview-modal title “这一刻，值得被看见”.
No 珍藏, 关于我, bottom navigation or extra controls.
Preserve exact business copy with beautiful precise Chinese. The overall board must feel like a real refined mobile product, clean and immediately understandable.

## 第二张提示词

Create the SECOND matching UI design board for Chinese WeChat mini program “夸一夸”, consisting of EXACTLY THREE full mobile screens arranged horizontally: 我的, 套餐, 使用记录. Match reference1's mobile artboard proportions, colors, fonts, controls, margins and visual finish exactly so this feels like one coherent six-screen design set. Reference1 is the first three-screen board, only a DESIGN SYSTEM reference; do not repeat those three pages. Reference2 is the current ledger screenshot and is the exact INFORMATION STRUCTURE reference for 使用记录.
Wide landscape output, very high resolution comparable to reference1. Three equal flat mobile screen artboards about 390x844 each, full screen bottoms visible, gently rounded outer corners and subtle shadow on warm neutral board, no physical phone hardware, no perspective, no external headings or captions.
Shared visual system: ivory #FAF9F5 background, dark forest #263B31, jade #397C5F primary buttons, soft sage cards, tiny gold sun accents. Elegant Chinese Songti headlines, crisp Chinese sans labels, refined typography. 9:41 status bars, WeChat top-right capsules, bottom home indicators. Calm ample whitespace is intentional. Don't fill empty lower areas with extra modules. NO bottom navigation.

SCREEN 1 — 我的
Back chevron, centered top title “我的”, capsule.
Account block: pale sage circular avatar “叶”, account name “小叶”. Under it small “平凡的日子，也有闪闪发光的时刻”.
One lovely pale sage quota card:
small heading “给自己一点小小的肯定”
large elegant numeral “1” and adjacent smaller “次可用”.
Footer left “免费体验剩余 1 次”; footer right small filled jade pill “了解包月 ↗”.
This card is the ONLY package entrance in this screen.
Below small section label “我的日常”.
Exactly TWO navigation rows with restrained line icons and subtle separators:
image icon / “我的夸夸” / smaller “制作中的海报也在这里” / chevron.
clock icon / “使用记录” / smaller “查看每一笔次数变化” / chevron.
Below ample whitespace, then small muted Songti quote “愿你也看见，自己的好。”
Do not show any other list row or section. Specifically no “关于我”, “个人资料”, “套餐与次数”, standalone “套餐” menu, “其他”, “反馈”, “使用帮助” or settings.

SCREEN 2 — 套餐
Back chevron, centered title EXACTLY “套餐”, capsule.
Small understated gold sun, centered editorial heading in two lines:
“给每一天，
多一点肯定。”
Below small “五种生活场景，都在这一份心意里。”
One well-spaced pale sage subscription card, very fine green outline:
label “夸一夸 · 包月套餐”; small badge “30 天有效”.
Large elegant numeral “30” with smaller “次海报制作”.
Secondary line “购买成功起 30 天 · 手动续购”.
Fine divider, bottom label “套餐价格” left, “价格待公布” right.
24px gap then one full-width jade CTA “开通包月套餐”.
Small centered below “30 天有效 · 不自动续费”.
Subtle cream banner “免费体验剩余 1 次，已生成的海报可一直回看。”
Then open blank space until home indicator.
CRITICAL: NO benefit checklist, NO checkmark rows, NO detailed usage rules, NO “次数怎么用”, NO “查看次数使用记录”. The screen title must NOT be “套餐与次数”. Do not invent a price or currency.

SCREEN 3 — 使用记录
Back chevron, centered “使用记录”, capsule.
No hero heading, no introductory paragraph.
Simple flat date-grouped ledger with generous margins:
bold date “2026.09.28”
first row “14:32” left and “−1 次” right, fine divider.
second row “14:20” left and “−1 次” right, fine divider.
That's all; ample calm blank space below. Dates and time must be plainly legible. It is a usage ledger, not image thumbnails or status cards.
NO titles like “提交制作 · 预占 · 免费体验”.
NO “每一次，都清清楚楚。” or “生成成功计次，制作失败释放预占次数。”.
NO extra columns, transaction descriptions, download controls or category badges. Just the grouped date, each time, and count change.

ABSOLUTE EXCLUSIONS: no prototype/demo/example/local-storage/designer labels anywhere; never show “原型”, “演示”, “示例”, “本机”. No bottom tabs, no favorites, no badges or charts invented to fill space. No redesign of confirmed product structure. Only authentic formal business UI. Every Chinese glyph should be well formed and accurate. Preserve the minimalism of the requested content; this should feel exceptionally refined, practical and coherent with the first board.

