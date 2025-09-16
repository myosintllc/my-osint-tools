# coding: utf-8
import json

from bs4 import BeautifulSoup

def get_bookmarklets_from_website():
    print("Retrieving HTML with definitions for bookmarklets from ../index.html")
    with open("../index.html", "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    bookmarklets = soup.select("tr a[data-name]")
    print(f"{len(bookmarklets)} possible bookmarklets retrieved")
    expected_keys = {
        "domain": "data-domain",
        "name": "data-name",
        "replace": "data-replace-open"
    }

    print("Extracting bookmarklets from HTML")
    bookmarklet_definitions = []
    for bml_tag in bookmarklets:
        bml = {}
        for k,v in expected_keys.items():
            try:
                tag_value = bml_tag.get(v)
                tag_value = json.loads(tag_value)
            except Exception:
                pass
            bml[k] = tag_value
        bml["js"] = bml_tag.get("href")
        bml["title"] = bml_tag.get_text().strip()

        if not all([bml[key] for key in ["name", "domain", "js", "title"]]):
            print(f"Tag does not have all required keys: {bml}")
            continue

        bookmarklet_definitions.append(bml)
    print(f"{len(bookmarklet_definitions)} valid definitions for bookmarklets extracted from index.html")
    return bookmarklet_definitions

def generate_js_bookmarklets(bookmarklets):
    print("Generating bookmarkletsJSON array")
    lines = ["const bookmarkletsJSON = ["]
    for bookmarklet in bookmarklets:
        title = bookmarklet["title"]
        js_func = bookmarklet["name"]
        domain = bookmarklet["domain"]

        lines.append("  {")
        lines.append(f'    title: "{title}",')
        lines.append(f'    js: {js_func},')
        lines.append(f'    domain: "{domain}",')
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)

def build_js_definitions(bookmarklet_definitions):
    print("Building JS for Tampermonkey based on bookmarklets")
    js_definitions = []
    for bml in bookmarklet_definitions:
        js = bml["js"].replace("javascript:","")
        js_definition = f"const {bml['name']} = {js}"
        if js_definition.endswith(";"):
            js_definition = js_definition[:-1]
        if js_definition.endswith("()"):
            js_definition = js_definition[:-2]
        js_definition += ";"

        if bml.get("replace"):
            js_definition = js_definition.replace("window.open", "GM_openInTab")
        js_definitions.append(js_definition)
    js_def_str = "\n\n".join(js_definitions)
    return js_def_str

def build_userscript(VERSION):
    print(f"Updating userscript.js to version {VERSION}")
    bookmarklet_definitions = get_bookmarklets_from_website()
    bookmark_list_str = generate_js_bookmarklets(bookmarklet_definitions)
    javascript_definitions_str = build_js_definitions(bookmarklet_definitions)
    user_script_elements = [HEADER.strip(), javascript_definitions_str.strip(), bookmark_list_str.strip(), FOOTER.strip()]
    user_script = "\n\n".join(user_script_elements)
    return user_script

with open("VERSION", "r") as f:
    VERSION = f.read().strip()

HEADER = f"""
// ==UserScript==
// @name         My OSINT Training
// @namespace    http://tampermonkey.net/
// @version      {VERSION}
// @description  Tamper before bookmarklets
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @noframes
// ==/UserScript==
"""

FOOTER = r"""
const currentDomain = window.location.hostname.replace(/^www\./, '');

if (window.top === window.self) {
    bookmarkletsJSON.forEach(item => {
        if (currentDomain.includes(item.domain) || item.domain === '*') {
            console.log(`Initializing worker: ${item.title}`);
            GM_registerMenuCommand(item.title, item.js);
        }
    })
}
"""

if __name__ == "__main__":
    user_script = build_userscript(VERSION)
    print("Storing new version of userscript.js in repo")
    with open("userscript.js", "w", encoding="utf-8") as f:
        f.write(user_script)
    print("Update complete")
