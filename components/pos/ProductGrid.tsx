"use client"

import { useCart } from "@/contexts/CartContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  barcode: string
  price: number
  category: string
  quantityInStock: number
  image?: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    if (product.quantityInStock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      category: product.category,
      maxStock: product.quantityInStock,
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to cart`,
    })
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 text-center">Try adjusting your search terms or category filter</p>
        </CardContent>
      </Card>
    )
  }

return (
  <div className="max-h-[64vh] overflow-y-auto pr-2">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
              {/* {product.image} */}
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-xs text-gray-900 line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
                <Badge
                  variant={
                    product.quantityInStock > 10
                      ? "default"
                      : product.quantityInStock > 0
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-[10px] px-2 py-0.5"
                >
                  {product.quantityInStock > 0
                    ? `${product.quantityInStock} left`
                    : "Out of stock"}
                </Badge>
              </div>

              <p className="text-[10px] text-gray-500">{product.category}</p>

              <Button
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => handleAddToCart(product)}
                disabled={product.quantityInStock <= 0}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

}
