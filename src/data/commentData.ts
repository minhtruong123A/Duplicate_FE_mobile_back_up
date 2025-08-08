// src/data/commentData.ts
export type Comment = {
    id: string;
    productId: string;
    author: string;
    avatarUrl: string;
    text: string;
    rating: number;
    timestamp: string;
};

export const fakeCommentData: Comment[] = [
    {
        id: 'cmt001',
        productId: 'prod001',
        author: 'CollectorX',
        avatarUrl: 'https://placehold.co/40x40/EFEFEF/333?text=CX',
        text: 'Thẻ bài tuyệt đẹp, chất lượng in sắc nét!',
        rating: 5,
        timestamp: '2 ngày trước',
    },
    {
        id: 'cmt002',
        productId: 'prod001',
        author: 'AnimeFan99',
        avatarUrl: 'https://placehold.co/40x40/EFEFEF/333?text=AF',
        text: 'Rất hài lòng với sản phẩm. Giao hàng cũng nhanh.',
        rating: 4,
        timestamp: '5 ngày trước',
    },
    {
        id: 'cmt003',
        productId: 'prod002',
        author: 'ArtLover',
        avatarUrl: 'https://placehold.co/40x40/EFEFEF/333?text=AL',
        text: 'Thiết kế rất nghệ thuật, mình rất thích.',
        rating: 5,
        timestamp: '1 tuần trước',
    },
];
