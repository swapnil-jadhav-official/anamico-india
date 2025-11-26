'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { message, Table, Space, Modal, Select, Pagination } from 'antd';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ECommerceHeader } from '@/components/e-commerce-header';
import { Footer } from '@/components/footer';
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb';

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string | null;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [total, setTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch reviews
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchReviews();
    }
  }, [session, filter, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const approved = filter === 'all' ? '' : filter === 'approved' ? 'true' : 'false';
      const url = `/api/admin/reviews?approved=${approved}&limit=${pagination.limit}&offset=${(pagination.page - 1) * pagination.limit}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve review');

      message.success('Review approved successfully');
      fetchReviews();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving review:', error);
      message.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: false }),
      });

      if (!response.ok) throw new Error('Failed to reject review');

      message.success('Review rejected successfully');
      fetchReviews();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting review:', error);
      message.error('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete this review?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete review');

          message.success('Review deleted successfully');
          fetchReviews();
          setShowDetailModal(false);
        } catch (error) {
          console.error('Error deleting review:', error);
          message.error('Failed to delete review');
        }
      },
    });
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span className="font-medium">{title}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <StarRating rating={rating} />,
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'isApproved',
      key: 'isApproved',
      render: (isApproved: boolean) => (
        <Badge className={isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
          {isApproved ? 'Approved' : 'Pending'}
        </Badge>
      ),
      width: 120,
    },
    {
      title: 'Helpful',
      dataIndex: 'helpfulCount',
      key: 'helpfulCount',
      width: 80,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Review) => (
        <Space>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReview(record);
              setShowDetailModal(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!record.isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(record.id)}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
            </Button>
          )}
          {record.isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(record.id)}
            >
              <XCircle className="w-4 h-4 text-red-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(record.id)}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <ECommerceHeader />
      <main className="flex-1 p-4 sm:p-6">
        <AdminBreadcrumb />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Reviews</h1>
          <p className="text-gray-600">Manage and moderate customer product reviews</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Review Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter
                </label>
                <Select
                  value={filter}
                  onChange={(value) => {
                    setFilter(value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  style={{ width: '100%' }}
                  options={[
                    { label: 'All Reviews', value: 'all' },
                    { label: 'Pending Approval', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                  ]}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table
                columns={columns as any}
                dataSource={reviews.map((review) => ({
                  ...review,
                  key: review.id,
                }))}
                loading={loading}
                pagination={false}
                bordered
              />
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={total}
                onChange={(page) =>
                  setPagination({ ...pagination, page })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Review Detail Modal */}
        <Modal
          title={`Review - ${selectedReview?.title}`}
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={null}
          width={600}
        >
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1">
                  <StarRating rating={selectedReview.rating} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-gray-900">{selectedReview.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {selectedReview.comment || 'No additional comment'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <Badge
                    className={
                      selectedReview.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {selectedReview.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Helpful Count</label>
                <p className="mt-1 text-gray-900">{selectedReview.helpfulCount}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                {!selectedReview.isApproved && (
                  <Button
                    onClick={() => handleApprove(selectedReview.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Review
                  </Button>
                )}
                {selectedReview.isApproved && (
                  <Button
                    onClick={() => handleReject(selectedReview.id)}
                    variant="outline"
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Review
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(selectedReview.id)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Review
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </main>
      <Footer />
    </div>
  );
}
