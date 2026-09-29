# 多图海报设计调整

## 设计契约

- 交付：3:2 横版海报效果稿，以及原型图片预处理和排版调整。
- 用户与场景：五类人群上传生活照片，分享一张包含逐图夸赞的海报；手机近距离查看。
- 第一视觉焦点：最能表达本组记录的主照片，配合清晰的大标题；辅助照片和夸赞围绕主图展开。
- 设计命题：以主照片和有留白的图文关系，让用户先看见生活瞬间，再读到每一张照片对应的肯定。
- 保留：原图主体和重要场景、逐图夸赞、横版、合成一张与计一次、品牌夸一夸。
- 删除：等尺寸照片格子、强制居中裁切、图文无差别堆放。
- 继承：暖白纸面、深绿色宋体字、自然生活摄影；此前多图版式被否定，不作为版式参考。
- 参考构图：主图约占画面50%，标题约占左上30%，两张辅助照片沿右侧错落分布；字幕邻近各自照片；留白用于标题与图文分隔。
- 禁区：修改人物身份或动作、虚构物品、删掉用户上传的某张图、强行裁切人脸、把示例图片当作真实上传的生成结果。

## 图片处理与实施边界

正式流程：逐图识别主体与场景→判断安全裁切区、朝向、画质→必要时主体提取/清理干扰背景→统一曝光与色温→逐图夸赞→根据内容选择主辅图及版式→文字真实排版→逐图对应与视觉检查→输出一张海报。

- 每张图保存原始索引；处理、排序、文案和成品区域均绑定这一索引。
- 人物保持身份与原动作；处理不应创造原照片未表达的经历。
- 不强制所有图抠图：环境本身有意义时保留场景，主体明确且背景干扰时才处理背景。
- 分辨率不足、检测低信心或无法安全裁切时保留完整图片；不能静默丢图。
- 预期约5分钟，后台包含图像理解、处理与合成，前台提交成功后可离开。
- 当前网页只实现曝光/色调归一、比例分析、安全裁切/留边及主辅版式；智能识别、分割与背景融合仍待服务端图像模型。

## 生成效果稿

- 文件：`poster-editorial-v2.png`
- 模式：内置 imagegen。
- 素材：当前原型素材集中桌面、面包、花瓶三张图，作为方向参考；未使用或替换真实用户上传。
- 生成图为视觉探索，不作为任意上传照片的处理结果。图像模型生成过程可能重绘细节；真实产品须增加主体一致性验收。

## 提示词

Use case: compositing. Create ONE beautifully art-directed finished 3:2 landscape Chinese lifestyle praise poster, 1536x1024 or higher resolution. This is the SHARE POSTER itself, not a phone screen or app mockup.
Input: a 3 columns by 2 rows contact sheet containing six photos. Use ONLY these three source photos: top middle (sunlit desk with laptop, hand and ceramic mug), bottom middle (hands breaking a loaf of artisan bread), bottom right (yellow daisies in ceramic vase). Other three photos must NOT appear. Preserve the actual objects, hand poses, surfaces and photo identity from these sources. Do not invent unrelated people, objects, scenery or events.
Critically, process and artistically integrate the photographs BEFORE layout. Extract the loaf and hands with very clean natural edges from the bread photo; integrate them as a large hero image, retaining a little tabletop grounded shadow. Harmonize exposure, white balance and saturation among all three images to soft honey sunlight, cream and muted olive. Reframe the desk to emphasize the cup and hand while still retaining recognizable desk context. For the flowers keep the airy window light and delicate stems; blend the photo edge naturally into warm paper without losing flowers. Every source photo appears once, no duplication.
Style: premium Japanese/Chinese lifestyle magazine editorial composition, intimate, calm, beautifully precise paper collage, warm uncoated ivory paper, dark forest-green Chinese Songti headings, restrained modern sans captions, no giant decorative ornaments. This must feel like a designed keepsake, not an image gallery or a template.
Composition: clear asymmetrical hierarchy. LARGE expressive two-line headline in upper left on genuine open ivory space, taking roughly 30% width. Bread and hands hero occupying center-left to lower center, roughly 48% of canvas; subject artfully breaks out of image bounds instead of a rectangular card. Smaller sunlit desk crop, about 27% canvas width, top right; flower photo about 22% width bottom right. Support images have different scale and shape, never identical boxed cards. Use staggered rhythm and 6-8% safe margins. Every individual caption is physically next to its matching image, dark text on clear paper, not across busy photography. Keep all hands and key objects intact. No repeated rounded rectangles, no equal grids, no box shadows around each photo, no numbering, no UI buttons or wireframe notes. No generic decorative scribbles.
Exact Chinese title:
“你把日子，
过出了光。”
Tiny restrained eyebrow above title “夸一夸 · 日常”
Exact bread caption near bread hero, strong first line “亲手做的，格外香。”
second line “把一份用心，揉进了日常。”
Exact desk caption beside desk image “忙碌之间，也记得温柔待自己。”
Exact flower caption beside flowers “把花放进日常，把美好留给自己。”
Tiny date “2026.09.28” bottom left, small brand “夸一夸” with simple tiny gold sun bottom right.
Text must be legible, accurate and elegant, with a strong scale contrast between title and captions. The poster must look excellent both at full size and as a thumbnail. No phones, no exterior board, no product explanation.

