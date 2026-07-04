import os
import re
import shutil

src_dir = os.path.join(os.getcwd(), 'src')
components_dir = os.path.join(src_dir, 'components')

client_moves = {
    'layout': ['header.tsx', 'footer.tsx', 'landingLayout.tsx', 'mobileMenu.tsx', 'nav-links.tsx'],
    'cart': ['cartBadge.tsx', 'cartClient.tsx', 'cartItem.tsx', 'cartSummary.tsx'],
    'checkout': ['checkoutForm.tsx', 'checkoutSummary.tsx'],
    'collection': ['clearCollection.tsx', 'collectionClient.tsx', 'collectionFilterSelect.tsx', 'collectionProducts.tsx'],
    'product': ['cardProduct.tsx', 'detailCardModal.tsx', 'detailCardProduct.tsx', 'detailCardProductModal.tsx'],
    'order': ['detailOrder.tsx', 'orderBadge.tsx', 'orderConfirmationClient.tsx', 'ordersClient.tsx'],
    'user': ['changePass.tsx', 'profileClient.tsx', 'notificationUser.tsx'],
    'contact': ['contactClient.tsx', 'modalContact.tsx'],
    'common': ['customDropdown.tsx', 'formCustom.tsx', 'notFoundButtons.tsx', 'modalDeleteConfirmClient.tsx'],
    'pages': ['homeClient.tsx', 'storyClient.tsx']
}

admin_moves = {
    'layout': ['AdminHeader.tsx', 'navbar.tsx'],
    'dashboard': ['dashboardClient.tsx'],
    'product': ['productManagementClient.tsx', 'modalProduct.tsx', 'modalEditProduct.tsx', 'modalDeleteProduct.tsx'],
    'category': ['categoryManagementClient.tsx', 'modalCategory.tsx', 'modalEditCategory.tsx'],
    'order': ['ordersManagementClient.tsx', 'detailOrderAdmin.tsx', 'modalOrderAction.tsx'],
    'discount': ['discountCodeClient.tsx', 'modalDiscount.tsx', 'modalEditDiscount.tsx'],
    'ingredient': ['ingredientStoreClient.tsx', 'modalIngredient.tsx', 'modalEditIngre.tsx'],
    'customer': ['clientManagement.tsx', 'clientOrderModal.tsx', 'clientTable.tsx', 'clientPagination.tsx', 'clientSearchBar.tsx', 'clientStatusBadge.tsx'],
    'support': ['supportClient.tsx', 'modalSupport.tsx'],
    'common': ['TableResponsiveWrapper.tsx', 'modalDeleteConfirm.tsx', 'notificationAdmin.tsx']
}

comp_map = {}

def add_to_map(moves, base):
    for folder, files in moves.items():
        for file in files:
            name = file.replace('.tsx', '')
            comp_map[f"{base}/{name}"] = f"{base}/{folder}/{name}"

add_to_map(client_moves, 'client')
add_to_map(admin_moves, 'admin')


def resolve_import(current_file_path, import_str):
    if import_str.startswith('@/src/'):
        return os.path.join(src_dir, import_str.replace('@/src/', ''))
    elif import_str.startswith('@/components/'):
        return os.path.join(src_dir, import_str.replace('@/', ''))
    elif import_str.startswith('.'):
        current_dir = os.path.dirname(current_file_path)
        return os.path.normpath(os.path.join(current_dir, import_str))
    return None

def replacer_helper(file_path, import_path):
    resolved = resolve_import(file_path, import_path)
    if not resolved:
        return import_path
    if components_dir in resolved:
        imp_rel = os.path.relpath(resolved, components_dir)
        if imp_rel in comp_map:
            return f"@/src/components/{comp_map[imp_rel]}"
    return import_path

print("Updating imports...")
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Using regex to find string literals in import/export
            # e.g. import ... from '...'
            new_content = re.sub(
                r'(from|import)\s+([\'"])(.*?)\2',
                lambda m: m.group(1) + ' ' + m.group(2) + replacer_helper(file_path, m.group(3)) + m.group(2),
                content
            )
            
            # Also handle dynamic imports import('...')
            new_content = re.sub(
                r'import\s*\(\s*([\'"])(.*?)\1\s*\)',
                lambda m: 'import(' + m.group(1) + replacer_helper(file_path, m.group(2)) + m.group(1) + ')',
                new_content
            )

            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

print("Moving files...")
def move_files(moves, base):
    base_dir = os.path.join(components_dir, base)
    for folder, files in moves.items():
        target_dir = os.path.join(base_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        for file in files:
            old_path = os.path.join(base_dir, file)
            new_path = os.path.join(target_dir, file)
            if os.path.exists(old_path):
                shutil.move(old_path, new_path)
                print(f"Moved {old_path} -> {new_path}")

move_files(client_moves, 'client')
move_files(admin_moves, 'admin')
print("Done.")
