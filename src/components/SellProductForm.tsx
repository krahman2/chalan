import { useState } from 'react';
import type { Product } from '../types';

interface SellProductFormProps {
  product: Product;
  onSell: (quantity: number) => void;
  onCancel: () => void;
}

const SellProductForm: React.FC<SellProductFormProps> = ({ product, onSell, onCancel }) => {
  const [quantity, setQuantity] = useState(1);

  const handleSell = () => {
    if (quantity > 0 && quantity <= product.quantity) {
      onSell(quantity);
    } else {
      alert('Invalid quantity');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Sell {product.name}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min="1"
              max={product.quantity}
            />
            <p className="text-sm text-gray-500 mt-1">
              Available: {product.quantity}
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSell}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellProductForm; 