import asyncio
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright

# 配置参数
BASE_URL = "https://www.hsi.com.hk/eng"
DOMAIN = "www.hsi.com.hk"
MAX_PAGES = 9999  # 建议先设置上限进行测试，全站扫描可调大

async def crawl():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        visited_pages = set()
        to_visit = [BASE_URL]
        third_party_resources = {}  # 格式: {域名: [来源页面1, 来源页面2]}

        print(f"开始扫描网站: {BASE_URL}")

        page = await context.new_page()

        while to_visit and len(visited_pages) < MAX_PAGES:
            current_url = to_visit.pop(0)
            if current_url in visited_pages:
                continue
            
            visited_pages.add(current_url)
            print(f"[{len(visited_pages)}] 正在处理: {current_url}")

            # 监听并拦截请求
            def intercept_request(request):
                req_url = request.url
                parsed_req = urlparse(req_url)
                if parsed_req.netloc and DOMAIN not in parsed_req.netloc:
                    if parsed_req.netloc not in third_party_resources:
                        third_party_resources[parsed_req.netloc] = set()
                    third_party_resources[parsed_req.netloc].add(current_url)

            page.on("request", intercept_request)

            try:
                # 访问页面
                await page.goto(current_url, wait_until="load", timeout=30000)
                # 等待动态数据加载
                await asyncio.sleep(2) 
                
                # 提取同域名下的所有链接
                hrefs = await page.eval_on_selector_all("a[href]", "elements => elements.map(el => el.href)")
                for href in hrefs:
                    full_url = urljoin(BASE_URL, href).split('#')[0].rstrip('/')
                    if DOMAIN in full_url and "/eng" in full_url and full_url not in visited_pages:
                        if full_url not in to_visit:
                            to_visit.append(full_url)
                            
            except Exception as e:
                print(f"无法访问 {current_url}: {e}")
            
            # 移除当前页面的监听器，防止内存泄漏
            page.remove_listener("request", intercept_request)

        await browser.close()

        # 结果输出与保存
        print("\n" + "="*50)
        print(f"扫描完成！共遍历 {len(visited_pages)} 个页面。")
        print(f"共发现 {len(third_party_resources)} 个第三方域名。")
        
        with open("full_site_report.md", "w", encoding="utf-8") as f:
            f.write("# 恒生指数官网第三方调用审计报告\n\n")
            f.write("| 第三方域名 | 调用来源页面示例 |\n")
            f.write("| :--- | :--- |\n")
            for domain, sources in sorted(third_party_resources.items()):
                source_sample = list(sources)[:3] # 每个域名只列出前3个来源页面
                f.write(f"| `{domain}` | {', '.join(source_sample)} |\n")
        
        print("详细报告已保存至 full_site_report.md")

if __name__ == "__main__":
    asyncio.run(crawl())