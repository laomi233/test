import asyncio
import json
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright

# ================= 配置区域 =================
LOGIN_URL = "https://www.hsi.com.hk/eng/index360/login?type=expire"
USER_EMAIL = "ting.zhang@hsbc.com"
USER_PASSWORD = "====TZing2025===="
BASE_DOMAIN = "www.hsi.com.hk"
# 只允许在会员专区及其子路径爬取
INTERNAL_PATTERN = "/index360/eng"
# ===========================================

async def run_ultimate_scanner():
    async with async_playwright() as p:
        # 使用 headless=False 以便观察交互过程
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        context = await browser.new_context()
        page = await context.new_page()

        # 存储结果：{域名: {完整URL1, 完整URL2}}
        audit_results = {}
        visited_urls = set()
        queue = []

        # 1. 强大的拦截器：监控所有类型的请求（含 WebSocket）
        def request_handler(request):
            req_url = request.url
            parsed = urlparse(req_url)
            # 捕获第三方调用
            if parsed.netloc and BASE_DOMAIN not in parsed.netloc and not req_url.startswith("data:"):
                domain = parsed.netloc
                if domain not in audit_results:
                    audit_results[domain] = set()
                audit_results[domain].add(f"Page: {page.url} | Request: {req_url[:100]}...")

            # 捕捉 Next.js 的隐藏路由数据请求
            if "_next/data" in req_url and ".json" in req_url:
                print(f"   [路由探测] 发现隐藏数据接口: {req_url.split('/')[-1]}")

        page.on("request", request_handler)

        # 2. 模拟登录
        print("[*] 正在登录并处理 Angular 表单...")
        await page.goto(LOGIN_URL, wait_until="domcontentloaded")
        await page.fill('input[placeholder*="email"]', USER_EMAIL)
        await page.fill('input[type="password"]', USER_PASSWORD)
        await page.dispatch_event('input[placeholder*="email"]', "input")
        await page.dispatch_event('input[type="password"]', "input")
        await page.click("button.log-on-bt")

        try:
            # 等待进入专区关键元素
            await page.wait_for_selector('header[class*="header"]', timeout=60000)
            print(f"[+] 成功进入专区: {page.url}")
            queue.append(page.url)
        except:
            print("[!] 登录后未检测到 Header，请手动检查是否需要验证码。")
            await asyncio.sleep(20) # 留出手动干预时间

        # ---------------- 3. 深度交互扫描循环 ----------------
        while queue and len(visited_urls) < 50:
            current_url = queue.pop(0)
            if current_url in visited_urls:
                continue
            
            visited_urls.add(current_url)
            print(f"\n>>> 正在深度探测: {current_url}")
            
            try:
                await page.goto(current_url, wait_until="load", timeout=40000)
                await asyncio.sleep(5) # 等待 SPA 组件和图表完全渲染

                # --- 策略 A: 自动触发隐藏菜单 (Hover) ---
                print("    - 正在触发悬停菜单...")
                nav_triggers = page.locator('header a[href="javascript:void(0);"], .styles_link__IWrI_')
                for i in range(await nav_triggers.count()):
                    try:
                        await nav_triggers.nth(i).hover()
                        await asyncio.sleep(1)
                    except: continue

                # --- 策略 B: 提取所有可见及隐藏链接 ---
                found_links = await page.evaluate("""
                    () => Array.from(document.querySelectorAll('a[href]')).map(a => a.href)
                """)
                for link in found_links:
                    full_url = urljoin(page.url, link).split('#')[0].rstrip('/')
                    if INTERNAL_PATTERN in full_url and full_url not in visited_urls:
                        if full_url not in queue:
                            queue.append(full_url)

                # --- 策略 C: 模拟点击“卡片”或“详情”按钮 (探测非链接跳转) ---
                print("    - 正在探测交互式卡片...")
                # 寻找类似指数卡片、详情按钮等元素
                interactables = page.locator('div[class*="card"], div[class*="item"], button:has-text("Detail")')
                for i in range(min(await interactables.count(), 10)):
                    try:
                        target = interactables.nth(i)
                        if await target.is_visible():
                            old_url = page.url
                            await target.click(timeout=3000)
                            await asyncio.sleep(3)
                            
                            if page.url != old_url:
                                print(f"      [发现隐藏页] -> {page.url}")
                                if INTERNAL_PATTERN in page.url and page.url not in visited_urls:
                                    queue.append(page.url)
                                await page.go_back()
                                await asyncio.sleep(2)
                    except: continue

            except Exception as e:
                print(f"    [!] 探测页面失败: {e}")

        await browser.close()
        generate_final_report(audit_results, visited_urls)

def generate_final_report(results, visited):
    filename = "hsi_ultimate_audit.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write("# HSI Index360 全方位审计报告 (含隐藏页面)\n\n")
        f.write(f"- **总共遍历的独立 URL**: {len(visited)}\n")
        f.write(f"- **发现的第三方域名总数**: {len(results)}\n\n")
        f.write("| 第三方域名 | 典型调用场景 (Page & Request) |\n")
        f.write("| :--- | :--- |\n")
        for domain, details in sorted(results.items()):
            # 每个域名展示前 5 条详细记录
            detail_str = "<br>".join(list(details)[:5])
            f.write(f"| **{domain}** | {detail_str} |\n")
    print(f"\n[√] 审计完成！报告已保存至: {filename}")

if __name__ == "__main__":
    asyncio.run(run_ultimate_scanner())