import { Category, GalleryImage, Product } from '../types';
import {
  ABOUT_CONTENT as CATALOG_ABOUT,
  CANDY_BAR_PACKAGES,
  CATEGORY_ORDER,
  CONTACT_INFO as CATALOG_CONTACT,
  GALLERY_IMAGES,
  PRODUCTS,
} from '../data/sladkaFazulkaCatalog';

export const CATEGORIES: Category[] = [...CATEGORY_ORDER];

export const ABOUT_CONTENT = CATALOG_ABOUT;
export const CONTACT_INFO = CATALOG_CONTACT;

export const MOCK_PRODUCTS: Product[] = PRODUCTS;
export const MOCK_GALLERY: GalleryImage[] = GALLERY_IMAGES;
export const MOCK_CANDY_BAR_PACKAGES = CANDY_BAR_PACKAGES;
