#!/bin/bash
cd /Users/admin/Documents/shop_nen_thom/project

echo "1. Deleting duplicate files..."
# client root files
rm -f src/components/client/{cardProduct.tsx,cartItem.tsx,cartSummary.tsx,checkoutForm.tsx,checkoutSummary.tsx,detailCardModal.tsx,detailCardProduct.tsx,formCustom.tsx,header.tsx,modalContact.tsx,nav-links.tsx,clearCollection.tsx,collectionFilterSelect.tsx,collectionClient.tsx,collectionProducts.tsx}
# admin root files
rm -f src/components/admin/{modalCategory.tsx,modalDeleteProduct.tsx,modalDiscount.tsx,modalEditCategory.tsx,modalEditDiscount.tsx,modalEditIngre.tsx,modalEditProduct.tsx,modalIngredient.tsx,modalSupport.tsx,navbar.tsx,productManagementClient.tsx,dashboardClient.tsx,AdminHeader.tsx}

echo "2. Deleting empty directories..."
rm -rf src/actions
rm -rf src/types

echo "3. Renaming components..."
mv src/components/ui/Spinner.tsx src/components/ui/spinner.tsx 2>/dev/null || true
mv src/components/ui/TiltWrapper.tsx src/components/ui/tiltWrapper.tsx 2>/dev/null || true
mv src/components/ui/aos-provider.tsx src/components/ui/aosProvider.tsx 2>/dev/null || true
mv src/components/ui/toast-provider.tsx src/components/ui/toastProvider.tsx 2>/dev/null || true
mv src/components/admin/layout/AdminHeader.tsx src/components/admin/layout/adminHeader.tsx 2>/dev/null || true
mv src/components/admin/common/TableResponsiveWrapper.tsx src/components/admin/common/tableResponsiveWrapper.tsx 2>/dev/null || true
mv src/components/client/layout/nav-links.tsx src/components/client/layout/navLinks.tsx 2>/dev/null || true

echo "4. Uninstalling packages..."
npm uninstall react-hook-form resend

echo "5. Moving asset folder..."
mkdir -p public/assets
mv asset/* public/assets/ 2>/dev/null || true
rmdir asset 2>/dev/null || true

echo "Done running basic FS changes!"
