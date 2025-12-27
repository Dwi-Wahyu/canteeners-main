"use server";

import { prisma } from "@/lib/prisma";
import {
  EditProductInput,
  CreateProductOptionInput,
  CreateProductOptionValueInput,
  EditProductOptionValueInput,
  CreateProductInput,
  EditProductOptionInput,
} from "@/features/product/types/product-schema";
import { revalidatePath } from "next/cache";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { del } from "@vercel/blob";
import { getImageUrl } from "@/helper/get-image-url";

async function updateMaximumShopPrice(shop_id: string, maximum_price: number) {
  await prisma.shop.update({
    where: {
      id: shop_id,
    },
    data: {
      maximum_price,
    },
  });
}

async function updateMinimumShopPrice(shop_id: string, minimum_price: number) {
  await prisma.shop.update({
    where: {
      id: shop_id,
    },
    data: {
      minimum_price,
    },
  });
}

export async function createProduct(
  payload: CreateProductInput
): Promise<ServerActionReturn<void>> {
  const { price, cost, categories, ...data } = payload;

  try {
    const created = await prisma.product.create({
      data: {
        ...data,
        price: parseFloat(price),
        ...(cost ? { cost: parseInt(cost) } : {}),
        ...(categories.length > 0
          ? {
              categories: {
                createMany: {
                  data: categories.map((category) => ({
                    category_id: parseInt(category.value),
                  })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
    });

    const priceAggregate = await prisma.product.aggregate({
      where: {
        shop_id: payload.shop_id,
        is_available: true,
      },
      _min: { price: true },
      _max: { price: true },
    });

    const newMinimumPrice = priceAggregate._min.price;
    const newMaximumPrice = priceAggregate._max.price;

    if (newMinimumPrice !== null) {
      await updateMinimumShopPrice(payload.shop_id, newMinimumPrice);
    }

    if (newMaximumPrice !== null) {
      await updateMaximumShopPrice(payload.shop_id, newMaximumPrice);
    }

    console.log(created);

    return successResponse(undefined, "Berhasil input produk");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function updateProduct(
  payload: EditProductInput,
  isUpdatingImage: boolean,
  previousImageUrl: string
): Promise<ServerActionReturn<void>> {
  const { price, cost, categories, id, ...data } = payload;
  const productPrice = parseFloat(price);

  try {
    if (isUpdatingImage) {
      // Delete previous product image
      await del(getImageUrl(previousImageUrl));
    }

    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: productPrice,
        ...(cost ? { cost: parseInt(cost) } : {}),
        ...(categories.length > 0
          ? {
              categories: {
                deleteMany: {},
                createMany: {
                  data: categories.map((category) => ({
                    category_id: parseInt(category.value),
                  })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
    });

    const priceAggregate = await prisma.product.aggregate({
      where: {
        shop_id: payload.shop_id,
        is_available: true,
      },
      _min: { price: true },
      _max: { price: true },
    });

    const newMinimumPrice = priceAggregate._min.price;
    const newMaximumPrice = priceAggregate._max.price;

    if (newMinimumPrice !== null) {
      await updateMinimumShopPrice(payload.shop_id, newMinimumPrice);
    }

    if (newMaximumPrice !== null) {
      await updateMaximumShopPrice(payload.shop_id, newMaximumPrice);
    }

    return successResponse(undefined, "Berhasil update produk");
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse("Terjadi kesalahan saat mengupdate produk");
  }
}

export async function toggleProductAvailable(
  id: string
): Promise<ServerActionReturn<boolean>> {
  try {
    const current = await prisma.product.findFirst({
      where: {
        id,
      },
      select: {
        is_available: true,
      },
    });

    if (!current) {
      return errorResponse("Produk tidak ditemukan");
    }

    const updated = await prisma.product.update({
      where: {
        id,
      },
      data: {
        is_available: !current.is_available,
      },
      select: {
        is_available: true,
      },
    });

    revalidatePath("/dashboard-kedai/produk");

    return successResponse(
      updated.is_available,
      "Berhasil mengubah status produk"
    );
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function createProductOption(
  payload: CreateProductOptionInput
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.productOption.create({
      data: payload,
    });

    revalidatePath("/dashboard-kedai/produk/" + payload.product_id);

    return successResponse(undefined, "Sukses tambah varian");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan saat tambah varian");
  }
}

export async function createProductOptionValue({
  payload,
  product_id,
}: {
  payload: CreateProductOptionValueInput;
  product_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { product_option_id, additional_price, value } = payload;
    await prisma.productOptionValue.create({
      data: {
        product_option_id,
        ...(additional_price && {
          additional_price: parseFloat(additional_price),
        }),
        value,
      },
    });

    revalidatePath("/dashboard-kedai/produk/" + product_id);

    return successResponse(undefined, "Sukses tambahkan opsi pilihan");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan saat menambahkan pilihan");
  }
}

export async function editProductOption({
  payload,
  product_id,
}: {
  payload: EditProductOptionInput;
  product_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { id, is_required, option, type } = payload;
    await prisma.productOption.update({
      where: {
        id,
      },
      data: {
        is_required,
        option,
        type,
        product_id,
      },
    });

    revalidatePath("/dashboard-kedai/produk/" + product_id);

    return successResponse(undefined, "Sukses edit opsi pilihan");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan saat edit pilihan");
  }
}

export async function editProductOptionValue({
  payload,
  product_id,
}: {
  payload: EditProductOptionValueInput;
  product_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { id, additional_price, value } = payload;
    await prisma.productOptionValue.update({
      where: {
        id,
      },
      data: {
        ...(additional_price && {
          additional_price: parseFloat(additional_price),
        }),
        value,
      },
    });

    revalidatePath("/dashboard-kedai/produk/" + product_id);

    return successResponse(undefined, "Sukses edit opsi pilihan");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan saat edit pilihan");
  }
}

export async function deleteProduct(
  id: string
): Promise<ServerActionReturn<void>> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product) {
      return errorResponse("Produk tidak ditemukan");
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    await del(getImageUrl(product.image_url));

    return successResponse(undefined, "Sukses menghapus varian");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function deleteProductOption(
  id: string
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.productOption.delete({
      where: {
        id,
      },
    });

    return successResponse(undefined, "Sukses menghapus varian");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function deleteProductOptionValue(
  id: string
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.productOptionValue.delete({
      where: {
        id,
      },
    });

    return successResponse(undefined, "Sukses menghapus opsi");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function Example(
  payload: CreateProductInput
): Promise<ServerActionReturn<void>> {
  try {
    return successResponse(undefined, "");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}
