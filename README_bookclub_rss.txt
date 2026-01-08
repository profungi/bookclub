如何生成「所有 BiblioCommons library 的 Book Club RSS」表格（脚本会自动 double check）

1) 下载模板 CSV：book_club_rss_table_template.csv
2) 下载脚本：scrape_bibliocommons_bookclub_rss.py
3) 本地运行（需要 Python 3.10+）：

   python scrape_bibliocommons_bookclub_rss.py book_club_rss_table_template.csv output_bookclubs.csv

4) 输出文件 output_bookclubs.csv 就是你要的表格列：
   - library_name
   - book_club_name
   - book_club_url
   - rss_url
   - notes（是否验证通过、或失败原因）

脚本 double check 的“准确性校验”：
- RSS/Atom URL 必须 HTTP 200
- content-type 包含 xml 或正文以 <rss / <feed / <?xml 开头
- 至少包含一个 <item> 或 <entry>

重要说明：
- 我在这个聊天环境里无法对你列出的几百个站点逐一抓取并逐条校验（有调用次数/节流限制）。
- 但脚本会把“抓取 + 发现 RSS + 验证”一次性跑完，确保每条 rss_url 都是真能用的。

可调项：
- 如果某些馆把活动类型叫 “Book Discussion / Reading Group”，脚本已一起匹配。
  你也可以在脚本里修改 BOOK_CLUB_LABEL_RE 增加关键词。
