import re
import os

path = "/Users/ahmadoz/Documents/ERMDERAAH-main/src/components/TasksPage.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: px-4 py-2 text-sm text-right
pattern1 = r'(className=\{cn\("w-full px-4 py-2 text-sm text-right)( rounded-lg transition-colors",.*?)\}>\s+\{PRIORITY_CONFIG\[p\]\.label\}'
replacement1 = r'\1 flex items-center justify-between\2}>\n                            <span>{PRIORITY_CONFIG[p].label}</span>\n                            <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />'

# Pattern 2: px-3 py-1.5 text-xs text-right
pattern2 = r'(className=\{cn\("w-full px-3 py-1\.5 text-xs text-right)( rounded-lg transition-colors",.*?)\}>\s+\{PRIORITY_CONFIG\[p\]\.label\}'
replacement2 = r'\1 flex items-center justify-between\2}>\n                                    <span>{PRIORITY_CONFIG[p].label}</span>\n                                    <Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />'

# Apply replacements
new_content = re.sub(pattern1, replacement1, content)
new_content = re.sub(pattern2, replacement2, new_content)

if new_content != content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print("Patterns not found.")
