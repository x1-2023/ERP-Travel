import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerList() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Link to={`/customers/${i}`} className="hover:text-primary">Customer {i}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">5 active promotions</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
