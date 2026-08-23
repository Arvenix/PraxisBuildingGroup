#!/usr/bin/env python3
"""
update-shared.py — sync the shared header and footer across every page.

OPTIONAL. The site does not need this script to run, build or deploy. It is a
convenience for the one maintenance task that is genuinely tedious on a static
site with no includes: changing the header or footer in 25 files at once.

HOW IT WORKS
    Both blocks are delimited in every page by marker comments:

        <!-- PRAXIS:HEADER:START ... -->   ...   <!-- PRAXIS:HEADER:END -->
        <!-- PRAXIS:FOOTER:START ... -->   ...   <!-- PRAXIS:FOOTER:END -->

    You edit ONE page (by default index.html), then run this script. It copies
    the marked blocks from that page into every other page, rewriting relative
    links so that pages inside services/ and locations/ get "../" prefixes.

    Nothing outside the markers is touched, so page content is safe.

USAGE
    cd praxisbg
    python3 tools/update-shared.py                 # preview, changes nothing
    python3 tools/update-shared.py --write         # apply
    python3 tools/update-shared.py --source about.html --write

AFTER RUNNING
    Check `git diff`, then open a root page, a services/ page and a
    locations/ page in a browser to confirm the navigation still works.

NOTE ON THE ACTIVE PAGE MARKER
    The current page's nav link carries aria-current="page". This script
    preserves each page's own aria-current placement, so the highlight stays
    correct after a sync.
"""

import argparse
import os
import re
import sys

MARKERS = ("HEADER", "FOOTER")

# 404.html deliberately uses root absolute links ("/about.html") because a host
# serves it at whatever URL the visitor requested, which may be several folders
# deep. Rewriting its links to relative paths would break them, so it is left
# alone. Edit its header and footer by hand on the rare occasion they change.
SKIP = ("404.html",)

# Link prefixes that must never be rewritten.
ABSOLUTE = ("http://", "https://", "mailto:", "tel:", "#", "/", "data:")


def find_pages(root):
    pages = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames
                       if d not in (".git", "tools", "node_modules")]
        for name in sorted(filenames):
            if name.endswith(".html") and name not in SKIP:
                pages.append(os.path.join(dirpath, name))
    return sorted(pages)


def block_pattern(kind):
    return re.compile(
        r"<!-- PRAXIS:%s:START.*?PRAXIS:%s:END -->" % (kind, kind),
        re.S,
    )


def extract(text, kind):
    match = block_pattern(kind).search(text)
    return match.group(0) if match else None


def retarget(block, depth):
    """Rewrite relative href/src values for a page `depth` folders deep."""
    prefix = "../" * depth

    def fix(match):
        attr, value = match.group(1), match.group(2)
        if value.startswith(ABSOLUTE):
            return match.group(0)
        # Strip any existing ../ prefixes, then apply the correct number.
        bare = re.sub(r"^(?:\.\./)+", "", value)
        return '%s="%s%s"' % (attr, prefix, bare)

    return re.sub(r'\b(href|src)="([^"]*)"', fix, block)


def preserve_active(new_block, old_block):
    """Keep this page's own aria-current="page" placement after a sync."""
    if 'aria-current="page"' not in old_block:
        return new_block.replace(' aria-current="page"', "")

    # Which nav target was marked current on this page?
    marked = re.search(
        r'href="([^"]+)"[^>]*aria-current="page"', old_block)
    if not marked:
        return new_block
    target = re.sub(r"^(?:\.\./)+", "", marked.group(1))

    cleaned = new_block.replace(' aria-current="page"', "")

    def add(match):
        href = re.sub(r"^(?:\.\./)+", "", match.group(1))
        if href != target:
            return match.group(0)
        return match.group(0).replace('href="%s"' % match.group(1),
                                      'href="%s" aria-current="page"'
                                      % match.group(1), 1)

    return re.sub(r'<a class="primary-nav__link" href="([^"]+)"',
                  add, cleaned, count=0)


def main():
    parser = argparse.ArgumentParser(
        description="Sync the shared header and footer across all pages.")
    parser.add_argument("--source", default="index.html",
                        help="page to copy the blocks from (default index.html)")
    parser.add_argument("--write", action="store_true",
                        help="apply changes (otherwise this is a dry run)")
    parser.add_argument("--root", default=".",
                        help="repository root (default: current directory)")
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    source_path = os.path.join(root, args.source)

    if not os.path.isfile(source_path):
        sys.exit("Source page not found: %s" % source_path)

    with open(source_path, encoding="utf-8") as fh:
        source_text = fh.read()

    source_depth = len(os.path.relpath(source_path, root).split(os.sep)) - 1

    blocks = {}
    for kind in MARKERS:
        block = extract(source_text, kind)
        if block is None:
            sys.exit("No PRAXIS:%s markers found in %s" % (kind, args.source))
        # Normalise to root-relative before re-targeting per page.
        blocks[kind] = retarget(block, 0) if source_depth else block

    changed, skipped = [], []

    for path in find_pages(root):
        if os.path.samefile(path, source_path):
            continue
        rel = os.path.relpath(path, root)
        depth = len(rel.split(os.sep)) - 1

        with open(path, encoding="utf-8") as fh:
            text = fh.read()

        original = text
        for kind in MARKERS:
            existing = extract(text, kind)
            if existing is None:
                skipped.append((rel, kind))
                continue
            replacement = retarget(blocks[kind], depth)
            if kind == "HEADER":
                replacement = preserve_active(replacement, existing)
            text = block_pattern(kind).sub(
                lambda _m, r=replacement: r, text, count=1)

        if text != original:
            changed.append(rel)
            if args.write:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(text)

    print("Source: %s" % args.source)
    print("%s: %d page(s)" % ("Updated" if args.write else "Would update",
                              len(changed)))
    for rel in changed:
        print("  %s" % rel)
    for rel, kind in skipped:
        print("  !! %s has no PRAXIS:%s markers" % (rel, kind))
    if not args.write and changed:
        print("\nDry run. Re-run with --write to apply, "
              "then check `git diff`.")


if __name__ == "__main__":
    main()
