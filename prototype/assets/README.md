# 原型照片素材

`lifestyle-sheet.png` 通过内置 imagegen 工具生成，参考项目已确认效果图的摄影风格。不是用户上传照片，也不代表真实产品用户。使用位置：五类体验示例。

原始工具产物保留于 `/Users/xinwei/.codex/generated_images/01a0e5fe-a684-7c12-8af6-e2994f3b91f6/exec-4c57939b-22b2-404f-95e6-4242c21ea146.png`，当前副本为项目运行资产。

生成提示词：

> Create a PHOTOGRAPHIC ASSET SHEET for the approved 夸夸 app, using the supplied UI mockup ONLY as a reference for the warm natural photography and mother/daughter bicycle scene. Output NO UI, no text, no labels, no borders. A perfect 3-column by 2-row grid of SIX rectangular lifestyle PHOTOGRAPHS, all cells EXACTLY equal size, edge-to-edge no gaps. Overall sheet 2:1 landscape; each cell individually 4:3 landscape. Each photo is a complete framed scene, focal subjects centered with crop-safe margins. Top left: same Chinese mother in white shirt with small daughter in pink helmet learning to bicycle in sunny leafy park, candid caring warmth. Top middle: warm sunlit tidy creative workspace with laptop, notebook, hand setting down cup of tea, light wood desk, realistic workday completion feeling. Top right: Chinese college-age student studying with open notebook and pen at softly sunlit library desk, casual candid smile, no legible printed text. Bottom left: Chinese older woman joyfully singing into microphone at small sunny outdoor community gathering with greenery, energetic dignified equal adult portrayal. Bottom middle: freshly baked homemade rustic bread on white linen and light wood kitchen table, hands holding a piece, warm window light. Bottom right: a small vase of yellow wildflowers on a pale wooden windowsill with green garden outside. Fine realistic lifestyle photography, consistent warm daylight, natural greens, creamy whites, high quality human anatomy, no stock photo watermarks, no marketing text, no app buttons. The layout MUST be geometrically strict six equal rectangular cells, no overlapping or decorative collage, because each cell will be used as a separate photo asset.

实际产出为 3:1 横向素材表，仍为 3×2 等分。页面在本地读取等分照片，并按容器比例裁切；不将整张素材表作为用户示例海报。

## 2026-09-29 首页

参考：`design/home-reference-2026-09-29.png`（用户提供）。以下透明 PNG 由内置 Image Gen 根据同一参考生成，供首页静态装饰使用，不代替表单或按钮。

- `home-v3-hero.png`：手写主标题、金毛拍立得、黄色便签与叶子。
- `home-v3-upload.png`：上传区两侧拍立得、箭头与文字，中间留给真实上传控件。
- `home-v3-footer.png`：花草及底部手写短句。

图标：Remix Icon 4.9.1，来源 https://github.com/Remix-Design/RemixIcon ，许可保存在 `prototype/vendor/remixicon/LICENSE`。

当前首页主视觉：`home-v5-hero.png`。通过内置 Image Gen 编辑 `home-v3-hero.png`：先将大标题换为“发现美好 / 记录美好”，再删除左下“放张照片，说一句话，记录生活里的闪闪发光”副文案。保留透明背景、金毛拍立得、便签和植物。中间版本 `home-v4-hero.png` 保留作为过程资产，运行时使用 v5。
原始 v5：`/Users/xinwei/.codex/generated_images/01a0e5fe-a684-7c12-8af6-e2994f3b91f6/exec-5ce8b60c-0f68-4002-ac68-3e4a57c4fc90.png`。

当前首页 banner 已改用 `home-banner-landscape-2026-09-29.png`，直接复制用户提供的 `/Users/xinwei/Desktop/Codex 图像 2026年9月29日 14_29_54.png`，未重新生成或裁剪。原 v5 留作历史素材。

## 当前参考素材（2026-09-29 下午）

- `home-reference-hero.png`：基于 `design/home-reference-2026-09-29-v2.png` 通过 Image Gen 提取重建的湖景与手写标语，不含设备与控件。
- `records-reference-hero.png`：基于 `design/records-reference-2026-09-29.png` 生成的花枝、桌面与手账背景。
- `quota-reference-background.png`：基于 `design/profile-card-reference-2026-09-29.png` 生成的可用次数卡背景；数据和套餐入口由页面显示。
- `plan-reference-hero.png`：基于 `design/plan-reference-2026-09-29.png` 单独生成的便签和花枝背景。

此前 v3/v5 与 14:29 banner 为历史版本，不再用于当前首页。所有新图均已保存项目副本，原始用户图保存在 design 目录；页面使用真实照片记录，不伪造图中点赞数字。

- `plan-reference-footer.png`：基于套餐参考图生成的手写 slogan 和柔焦叶片装饰，不含任何业务控件。
