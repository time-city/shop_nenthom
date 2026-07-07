import os
import re

src_dir = os.path.join(os.getcwd(), 'src')

replacements = {
    # UI components
    'Spinner': 'spinner',
    'TiltWrapper': 'tiltWrapper',
    'aos-provider': 'aosProvider',
    'toast-provider': 'toastProvider',
    # Admin components
    'AdminHeader': 'adminHeader',
    'TableResponsiveWrapper': 'tableResponsiveWrapper',
    # Client components
    'nav-links': 'navLinks',
}

# Regex to match import/export paths for components
import_path_pattern = re.compile(r'(from|import)\s+([\'"])(.*?)\2')

# Replace functions
def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    changed = False

    # 1. Update component names in imports/exports
    def replacer(match):
        prefix = match.group(1)
        quote = match.group(2)
        import_path = match.group(3)
        
        # Check if the last part of the path matches any of our renamed files
        parts = import_path.split('/')
        last_part = parts[-1]
        
        if last_part in replacements:
            parts[-1] = replacements[last_part]
            new_path = '/'.join(parts)
            return f"{prefix} {quote}{new_path}{quote}"
        return match.group(0)
    
    # 2. Handle dynamic imports
    def dynamic_replacer(match):
        quote = match.group(1)
        import_path = match.group(2)
        parts = import_path.split('/')
        last_part = parts[-1]
        if last_part in replacements:
            parts[-1] = replacements[last_part]
            new_path = '/'.join(parts)
            return f"import({quote}{new_path}{quote})"
        return match.group(0)

    # 3. Update asset paths
    # Replace anything like ../../../../asset/ or @/asset/ with @/public/assets/
    def asset_replacer(match):
        quote = match.group(2)
        file_name = match.group(3)
        return f"from {quote}@/public/assets/{file_name}{quote}"

    new_content_1 = import_path_pattern.sub(replacer, new_content)
    new_content_2 = re.sub(r'import\s*\(\s*([\'"])(.*?)\1\s*\)', dynamic_replacer, new_content_1)
    
    # Replace relative asset imports (e.g., from "../../../../asset/filename.jpg")
    asset_pattern = re.compile(r'(from|import)\s+([\'"])(?:(?:\.\.\/)+|@/)asset/(.*?)\2')
    new_content_3 = asset_pattern.sub(asset_replacer, new_content_2)
    
    # Check if there are other usages of `asset/` (like css urls or direct strings)
    # e.g., url('/asset/...') -> url('/assets/...')
    # This might require manual replacement, but let's do a simple string replace for "url('/asset/" to "url('/assets/"
    # Actually wait, `asset/` was a directory at the root, so it wasn't served as `/asset/` statically because Next.js serves from `public`.
    # Let's replace any `../../asset/` in general.
    
    if new_content_3 != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content_3)
        return True
    return False

updated_files = []
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.css')):
            file_path = os.path.join(root, file)
            if process_file(file_path):
                updated_files.append(file_path)

print(f"Updated {len(updated_files)} files.")
