import { db } from '@/lib/prisma';
import type { ProductVariant } from '@prisma/client';

export type TransformedProductVariant = Omit<ProductVariant, 'price' | 'comparePrice' | 'costPrice' | 'weight'> & {
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  weight: number | null;
};

export type CreateVariantData = {
  productId: string;
  size: string;
  color: string;
  material?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  isActive?: boolean;
};

export type UpdateVariantData = {
  size?: string;
  color?: string;
  material?: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
  isActive?: boolean;
};

export type BulkVariantCreate = {
  productId: string;
  variants: Omit<CreateVariantData, 'productId'>[];
};

export type BulkVariantUpdate = {
  variantIds: string[];
  updates: UpdateVariantData;
};

export type SizeColorMatrix = {
  sizes: string[];
  colors: string[];
  selectedCombinations: { size: string; color: string }[];
  basePrice: number;
  baseStock: number;
  baseLowStockThreshold: number;
};

export type VariantTemplate = {
  name: string;
  price?: number;
  comparePrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
};

export class ProductVariantService {
  // Helper function to transform a single variant
  private static transformVariant(variant: ProductVariant): TransformedProductVariant {
    return {
      ...variant,
      price: variant.price.toNumber(),
      comparePrice: variant.comparePrice?.toNumber() || null,
      costPrice: variant.costPrice?.toNumber() || null,
      weight: variant.weight?.toNumber() || null
    };
  }

  // Helper function to transform multiple variants
  private static transformVariants(variants: ProductVariant[]): TransformedProductVariant[] {
    return variants.map(this.transformVariant);
  }
  // Get all variants for a product
  static async getProductVariants(productId: string): Promise<TransformedProductVariant[]> {
    const variants = await db.productVariant.findMany({
      where: { productId },
      orderBy: [
        { size: 'asc' },
        { color: 'asc' }
      ]
    });

    return variants.map(variant => ({
      ...variant,
      price: variant.price.toNumber(),
      comparePrice: variant.comparePrice?.toNumber() || null,
      costPrice: variant.costPrice?.toNumber() || null,
      weight: variant.weight?.toNumber() || null
    }));
  }

  // Get single variant by ID
  static async getVariantById(id: string): Promise<TransformedProductVariant | null> {
    const variant = await db.productVariant.findUnique({
      where: { id }
    });
    return variant ? this.transformVariant(variant) : null;
  }

  // Create single variant
  static async createVariant(data: CreateVariantData): Promise<TransformedProductVariant> {
    // Check for duplicate size/color combination
    const existing = await db.productVariant.findFirst({
      where: {
        productId: data.productId,
        size: data.size,
        color: data.color
      }
    });

    if (existing) {
      throw new Error(`Variant with size "${data.size}" and color "${data.color}" already exists`);
    }

    const variant = await db.productVariant.create({
      data: {
        ...data,
        isActive: data.isActive ?? true
      }
    });

    return this.transformVariant(variant);
  }

  // Update variant
  static async updateVariant(id: string, data: UpdateVariantData): Promise<TransformedProductVariant> {
    // If updating size/color, check for duplicates
    if (data.size || data.color) {
      const variant = await this.getVariantById(id);
      if (!variant) {
        throw new Error('Variant not found');
      }

      const existing = await db.productVariant.findFirst({
        where: {
          productId: variant.productId,
          size: data.size || variant.size,
          color: data.color || variant.color,
          NOT: { id }
        }
      });

      if (existing) {
        throw new Error(`Variant with size "${data.size || variant.size}" and color "${data.color || variant.color}" already exists`);
      }
    }

    const variant = await db.productVariant.update({
      where: { id },
      data
    });

    return this.transformVariant(variant);
  }

  // Delete variant
  static async deleteVariant(id: string): Promise<void> {
    await db.productVariant.delete({
      where: { id }
    });
  }

  // Bulk create variants from size/color matrix
  static async createVariantsFromMatrix(data: SizeColorMatrix & { productId: string; baseSku: string }): Promise<TransformedProductVariant[]> {
    const variants: CreateVariantData[] = [];

    for (const combination of data.selectedCombinations) {
      const sku = this.generateSKU(data.baseSku, combination.size, combination.color);
      
      variants.push({
        productId: data.productId,
        size: combination.size,
        color: combination.color,
        sku,
        price: data.basePrice,
        stock: data.baseStock,
        lowStockThreshold: data.baseLowStockThreshold,
        isActive: true
      });
    }

    // Check for existing variants
    const existingVariants = await db.productVariant.findMany({
      where: {
        productId: data.productId,
        OR: variants.map(v => ({
          size: v.size,
          color: v.color
        }))
      }
    });

    if (existingVariants.length > 0) {
      const duplicates = existingVariants.map(v => `${v.size}/${v.color}`).join(', ');
      throw new Error(`The following size/color combinations already exist: ${duplicates}`);
    }

    return db.productVariant.createMany({
      data: variants
    }).then(() => this.getProductVariants(data.productId));
  }

  // Bulk update variants
  static async bulkUpdateVariants(data: BulkVariantUpdate): Promise<TransformedProductVariant[]> {
    await db.productVariant.updateMany({
      where: {
        id: { in: data.variantIds }
      },
      data: data.updates
    });

    const variants = await db.productVariant.findMany({
      where: {
        id: { in: data.variantIds }
      }
    });

    return this.transformVariants(variants);
  }

  // Update stock for variant
  static async updateVariantStock(id: string, quantity: number): Promise<TransformedProductVariant> {
    const variant = await db.productVariant.update({
      where: { id },
      data: { stock: quantity }
    });
    return this.transformVariant(variant);
  }

  // Adjust stock (add/subtract)
  static async adjustVariantStock(id: string, adjustment: number): Promise<TransformedProductVariant> {
    const variant = await this.getVariantById(id);
    if (!variant) {
      throw new Error('Variant not found');
    }

    const newStock = Math.max(0, variant.stock + adjustment);

    return this.updateVariantStock(id, newStock);
  }

  // Get low stock variants
  static async getLowStockVariants(productId?: string): Promise<TransformedProductVariant[]> {
    // First get all variants, then filter by low stock threshold
    const variants = await db.productVariant.findMany({
      where: {
        isActive: true,
        ...(productId && { productId })
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { stock: 'asc' },
        { product: { name: 'asc' } }
      ]
    });

    // Filter variants where stock is less than or equal to their low stock threshold
    const lowStockVariants = variants.filter(variant => variant.stock <= variant.lowStockThreshold);
    return this.transformVariants(lowStockVariants);
  }

  // Generate SKU
  static generateSKU(baseSku: string, size: string, color: string): string {
    const sizeCode = size.replace(/\s+/g, '').toUpperCase();
    const colorCode = color.replace(/\s+/g, '').toUpperCase().substring(0, 3);
    return `${baseSku}-${sizeCode}-${colorCode}`;
  }

  // Validate SKU uniqueness
  static async validateSKU(sku: string, excludeId?: string): Promise<boolean> {
    const existing = await db.productVariant.findFirst({
      where: {
        sku,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    });

    return !existing;
  }

  // Get variant statistics
  static async getVariantStats(productId: string) {
    const variants = await this.getProductVariants(productId);
    
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const totalValue = variants.reduce((sum, v) => sum + (v.stock * Number(v.price)), 0);
    const lowStockCount = variants.filter(v => v.stock <= v.lowStockThreshold).length;
    const outOfStockCount = variants.filter(v => v.stock === 0).length;
    const activeCount = variants.filter(v => v.isActive).length;

    return {
      totalVariants: variants.length,
      activeVariants: activeCount,
      totalStock,
      totalValue,
      lowStockCount,
      outOfStockCount,
      averagePrice: variants.length > 0 ? variants.reduce((sum, v) => sum + Number(v.price), 0) / variants.length : 0
    };
  }

  // Duplicate variant with modifications
  static async duplicateVariant(id: string, modifications: Partial<CreateVariantData>): Promise<TransformedProductVariant> {
    const original = await this.getVariantById(id);
    if (!original) {
      throw new Error('Original variant not found');
    }

    const newVariantData: CreateVariantData = {
      productId: original.productId,
      size: modifications.size || original.size,
      color: modifications.color || original.color,
      material: modifications.material || original.material || undefined,
      sku: modifications.sku || this.generateSKU(original.sku.split('-')[0], modifications.size || original.size, modifications.color || original.color),
      price: modifications.price || original.price,
      comparePrice: modifications.comparePrice || original.comparePrice || undefined,
      costPrice: modifications.costPrice || original.costPrice || undefined,
      stock: modifications.stock || original.stock,
      lowStockThreshold: modifications.lowStockThreshold || original.lowStockThreshold,
      weight: modifications.weight || original.weight || undefined,
      isActive: modifications.isActive ?? original.isActive
    };

    return this.createVariant(newVariantData);
  }
}
