from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(f"file://{os.path.abspath('index.html')}")
    page.wait_for_timeout(1000)  # Wait for render
    page.click("#btn-overview")
    page.wait_for_timeout(500)
    page.screenshot(path="full_configurator_modal.png")
    browser.close()
