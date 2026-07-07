import re

file_path = "src/components/client/user/profileClient.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the type import
content = re.sub(r'import type { Driver } from "driver\.js";\n', '', content)
content = re.sub(r'import "driver\.js/dist/driver\.css";\n', '', content)

# Remove the whole useEffect that runs the driver.js tour
# We find the useEffect(() => { if (isLoading) return; let activeDriver ... }, [isLoading])
driver_pattern = re.compile(r'useEffect\(\(\) => \{\n\s+if \(isLoading\) return;\n\s+let activeDriver:(.*?)\}, \[isLoading\]\);', re.DOTALL)

content = driver_pattern.sub('', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

