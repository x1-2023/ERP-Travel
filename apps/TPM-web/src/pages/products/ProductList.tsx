import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Link to={`/products/${i}`} className="hover:text-primary">Product SKU-{i}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Category: Beverages</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
