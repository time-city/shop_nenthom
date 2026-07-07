import os
import re

target_dirs = [
    "src/components/admin",
    "src/components/client/product",
    "src/components/client/common"
]

import_pattern = re.compile(r'import\s+([a-zA-Z0-9_]+)\s+from\s+"@mui/material/([a-zA-Z0-9_]+)";')

for target_dir in target_dirs:
    if not os.path.exists(target_dir):
        continue
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                if "@mui/material" in content:
                    # Collect all MUI imports
                    mui_components = set()
                    def replacer(match):
                        mui_components.add(match.group(1))
                        return "" # Delete the old import

                    new_content = import_pattern.sub(replacer, content)
                    
                    if mui_components:
                        # Find where to insert the new import
                        # Let's insert it right after the "use client"; or at the top
                        components_str = ", ".join(sorted(mui_components))
                        new_import = f'import {{ {components_str} }} from "@/src/components/ui/mui-mock";\n'
                        
                        # Remove duplicate empty lines left by deleted imports
                        new_content = re.sub(r'\n{3,}', '\n\n', new_content)
                        
                        if '"use client";' in new_content:
                            new_content = new_content.replace('"use client";', f'"use client";\n{new_import}')
                        else:
                            new_content = new_import + new_content
                        
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Replaced MUI in {file_path}")

