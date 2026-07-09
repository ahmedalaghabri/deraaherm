import sys
import os

path = "/Users/ahmadoz/Documents/ERMDERAAH-main/src/components/TasksPage.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the priority dropdown options in multiple places
# This targets the pattern where button has text-right and we want to add flex/justify-between
pattern = r'(className=\{cn\("w-full px-4 py-2 text-sm text-right)( rounded-lg transition-colors".*?\)\}>\s+)\{PRIORITY_CONFIG\[p\]\.label\}'

# We'll use re.sub with a function to handle the replacement
import re

def repl(m):
    # m.group(1) is the start of className
    # m.group(2) is the rest of className and the start of button content
    return f'{m.group(1)} flex items-center justify-between{m.group(2)}<span>{{PRIORITY_CONFIG[p].label}}</span><Flag className={cn("w-4 h-4", PRIORITY_CONFIG[p].flag)} />'

new_content = re.sub(pattern, repl, content)

if new_content != content:
    with open(path, 'w', encoding='utfimport sys
import os

path = "/Users/ahmadoz/Documents/ERMDERAAH-main  import ostt
path = fouwith open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replare    content = f.read()

# Replace the priorul
# Replace the prioris t# This targets the pattern where button has text-right anIOpattern = r'(className=\{cn\("w-full px-4 py-2 text-sm text-right)( rounded-lg transition-colnt
# We'll use re.sub with a function to handle the replacement
import re

def repl(m):
    # m.group(1) is the start of className
 rn 2")
    else:
        # Final attempt: just replace the label where it'
def rep a     # m.groen    # m.group(2) is the rest of classNamepr    retill not found.")

