'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DatabaseCleanupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleCleanup = async () => {
    if (!confirmed) {
      alert('Please confirm by checking the checkbox');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-db', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to clean database');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            Database Cleanup
          </CardTitle>
          <CardDescription>
            Remove all test data and prepare for fresh Cloudinary images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action will delete all products, orders, cart items, and banners.
              Users will be kept intact.
            </AlertDescription>
          </Alert>

          {/* What will be deleted */}
          <div className="space-y-2">
            <h3 className="font-semibold">What will be deleted:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All products (with AWS S3 images)</li>
              <li>All orders and order items</li>
              <li>All cart items</li>
              <li>All banners</li>
            </ul>
          </div>

          {/* What will be kept */}
          <div className="space-y-2">
            <h3 className="font-semibold text-green-600">What will be kept:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All users and authentication data</li>
              <li>All sessions</li>
            </ul>
          </div>

          {/* Confirmation */}
          <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="confirm" className="text-sm cursor-pointer">
              I understand this action cannot be undone. Delete all data now.
            </label>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleCleanup}
            disabled={loading || !confirmed}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning Database...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clean Database Now
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Success!</strong> Database cleaned successfully.
                <div className="mt-2 text-sm">
                  <p>{result.message}</p>
                  <p className="text-muted-foreground mt-1">{result.note}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Next Steps */}
          {result && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Upload new products with Cloudinary images</li>
                <li>Create new banners with Cloudinary images</li>
                <li>Test the optimized image delivery</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
